import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadSource } from '@/core/upload';
import { useAddDealDisputeEvidenceMutation, useRequestEvidenceUploadSlotMutation } from '../../../api/dealDisputeApi';
import { DEAL_DISPUTE_LIMITS } from '../../../constants/dealDispute';
import { DEAL_UPLOAD_LIMIT, DEAL_UPLOAD_POLICY } from '../../../constants/dealUploads';
import {
  createDealEvidenceSchema,
  EMPTY_EVIDENCE,
  type DealEvidenceValues,
} from '../../../schemas/dealDisputeSchema';
import type { DealDisputeRefInput, DealRef } from '../../../types/deal';
import { isDealConflictError, reportDealFailure } from '../../../utils/dealAction';
import {
  isEvidenceLink,
  toEvidenceBody,
  type DealEvidenceTally,
  type DealShipmentPhotoRef,
} from '../../../utils/dealDispute';

export type EvidenceSource = 'media' | 'files';

/** `links`, `links.0` … land on the link field; the note on the note. */
const EVIDENCE_FIELDS: Readonly<Record<string, keyof DealEvidenceValues>> = {
  note: 'note',
  links: 'link',
  ...Object.fromEntries(
    Array.from({ length: DEAL_DISPUTE_LIMITS.maxLinks }, (_, index) => [`links.${index}`, 'link' as const]),
  ),
};

/**
 * One evidence entry (M9): the note (required), files uploaded as they're picked (mp4/mov video,
 * images, PDF, original quality), https links added one by one, and the courier-issue photos
 * already on the deal to point at. Every count stays inside what the viewer's side has left in
 * the dispute. Nothing can be taken back once sent, and the sheet says so.
 */
export const useDisputeEvidence = (
  ref: DealRef,
  room: DealEvidenceTally,
  photos: readonly DealShipmentPhotoRef[],
) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [links, setLinks] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);

  const schema = useMemo(() => createDealEvidenceSchema(t), [t]);
  const { control, handleSubmit, setError, setValue, getValues, clearErrors, reset } = useForm<DealEvidenceValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_EVIDENCE,
  });

  // — Files ————————————————————————————————————————————————————————
  const fileRoom = Math.min(DEAL_UPLOAD_LIMIT.evidence, room.files);
  const [requestSlot] = useRequestEvidenceUploadSlotMutation();
  const uploads = useFileUploads({
    policy: DEAL_UPLOAD_POLICY.evidence,
    limit: fileRoom,
    requestSlot: useCallback(request => requestSlot({ ref, request }).unwrap(), [ref, requestSlot]),
  });
  const { add, remaining } = uploads;
  const limitToast = useCallback(
    () => toastService.info(t('marketplace.deals.dispute.evidence.filesLimit', { count: fileRoom })),
    [fileRoom, t],
  );
  const pickFrom = useCallback(
    async (source: EvidenceSource) => {
      if (remaining <= 0) {
        limitToast();
        return;
      }
      try {
        let sources: UploadSource[];
        if (source === 'media') {
          // Original quality: evidence must stay readable (rule 07).
          const response = await launchImageLibrary({
            mediaType: 'mixed',
            quality: 1,
            assetRepresentationMode: 'current',
            selectionLimit: remaining,
          });
          if (response.didCancel) return;
          if (response.errorCode) throw new Error(response.errorCode);
          sources = (response.assets ?? []).flatMap<UploadSource>(asset =>
            asset.uri
              ? [{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]
              : [],
          );
        } else {
          const files = await pick({ type: [types.pdf, types.images, types.video], allowMultiSelection: true });
          sources = files.map(file => ({ uri: file.uri, name: file.name ?? file.uri, mime: file.type, size: file.size }));
        }
        if (sources.length === 0) return;
        setFilesError(null);
        if (add(sources) > 0) limitToast();
      } catch (err) {
        if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
        toastService.error(t('marketplace.deals.dispute.evidence.pickFailed'));
      }
    },
    [add, limitToast, remaining, t],
  );

  // — Links ————————————————————————————————————————————————————————
  const addLink = useCallback(() => {
    const value = getValues('link').trim();
    if (!value) return;
    if (!isEvidenceLink(value)) {
      setError('link', { type: 'link', message: t('validation.invalidUrl') });
      return;
    }
    if (!links.includes(value)) {
      if (links.length >= room.links) {
        setError('link', {
          type: 'limit',
          message: t('marketplace.deals.dispute.evidence.linksLimit', { count: room.links }),
        });
        return;
      }
      setLinks([...links, value]);
    }
    setValue('link', '');
    clearErrors('link');
  }, [clearErrors, getValues, links, room.links, setError, setValue, t]);
  const removeLink = useCallback((link: string) => setLinks(prev => prev.filter(entry => entry !== link)), []);

  // — Courier photos ————————————————————————————————————————————————
  const togglePhoto = useCallback((key: string) => {
    setPicked(prev => {
      if (prev.includes(key)) return prev.filter(entry => entry !== key);
      return prev.length < DEAL_DISPUTE_LIMITS.maxRefs ? [...prev, key] : prev;
    });
  }, []);

  // — Sheet ————————————————————————————————————————————————————————
  const clearUploads = uploads.clear;
  const open = useCallback(() => {
    reset(EMPTY_EVIDENCE);
    setLinks([]);
    setPicked([]);
    setFilesError(null);
    clearUploads();
    setVisible(true);
  }, [clearUploads, reset]);
  const close = useCallback(() => setVisible(false), []);

  const [addEvidence, { isLoading }] = useAddDealDisputeEvidenceMutation();
  const { fileIds, isUploading, hasFailed } = uploads;
  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading) return;
      if (isUploading) {
        toastService.info(t('marketplace.deals.dispute.evidence.waiting'));
        return;
      }
      if (hasFailed) {
        setFilesError(t('marketplace.deals.dispute.evidence.fixFiles'));
        return;
      }
      // A link still in the field goes too (the schema already checked it).
      const draft = values.link.trim();
      const allLinks = draft && !links.includes(draft) ? [...links, draft] : links;
      if (allLinks.length > room.links) {
        setError('link', {
          type: 'limit',
          message: t('marketplace.deals.dispute.evidence.linksLimit', { count: room.links }),
        });
        return;
      }
      const refs = photos
        .filter(photo => picked.includes(photo.key))
        .map<DealDisputeRefInput>(({ shipmentId, index }) => ({ type: 'shipment_photo', shipmentId, index }));
      try {
        await addEvidence({
          ref,
          body: toEvidenceBody({ note: values.note, links: allLinks, fileIds, refs }),
        }).unwrap();
        toastService.success(t('marketplace.deals.dispute.evidence.toast'));
        clearUploads();
        setVisible(false);
      } catch (err) {
        const error = normalizeApiError(err);
        // Window closed or a cap reached: the server says which, the deal and the thread refetch.
        if (isDealConflictError(error)) {
          toastService.error(error.message);
          if (error.code !== 'deal_dispute_evidence_limit') setVisible(false);
          return;
        }
        if (error.code === 'deal_upload_invalid') {
          setFilesError(error.message);
          return;
        }
        if (!applyServerFieldErrors(err, EVIDENCE_FIELDS, setError)) reportDealFailure(error);
      }
    })();
  }, [addEvidence, clearUploads, fileIds, handleSubmit, hasFailed, isLoading, isUploading, links, photos, picked, ref, room.links, setError, t]);

  return {
    visible,
    open,
    close,
    control,
    uploads,
    fileRoom,
    filesError,
    pickFrom,
    links,
    linkRoom: room.links,
    addLink,
    removeLink,
    photos,
    picked,
    togglePhoto,
    onSubmit,
    sending: isLoading,
  };
};

export type DisputeEvidenceModel = ReturnType<typeof useDisputeEvidence>;
