import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadEntry, type UploadSource } from '@/core/upload';
import {
  useCompleteBriefAttachmentMutation,
  useRemoveBriefAttachmentMutation,
  useRequestBriefAttachmentSlotMutation,
} from '../../../api/dealOfferApi';
import { DEAL_UPLOAD_LIMIT, DEAL_UPLOAD_POLICY } from '../../../constants/dealUploads';
import type { DealFile } from '../../../types/deal';

export type BriefFileSource = 'photos' | 'files';

/** One row of the files block: a file already in the draft, or one still on its way. */
export type BriefFileRow =
  | { kind: 'attached'; key: string; file: DealFile }
  | { kind: 'upload'; key: string; entry: UploadEntry };

/**
 * Brief reference files (≤ 5 images / PDFs): each uploads to the draft's signed slot, then
 * joins the draft (`complete`) and moves from the upload list to the attached files. Removing
 * an attached file deletes it from the draft; removing an upload aborts it.
 */
export const useBriefAttachments = (draftId: string | null) => {
  const { t } = useTranslation();
  const [requestSlot] = useRequestBriefAttachmentSlotMutation();
  const [completeAttachment] = useCompleteBriefAttachmentMutation();
  const [removeAttachment] = useRemoveBriefAttachmentMutation();
  const [attached, setAttached] = useState<DealFile[]>([]);
  const draftIdRef = useRef(draftId);
  draftIdRef.current = draftId;

  const uploads = useFileUploads({
    policy: DEAL_UPLOAD_POLICY.brief,
    limit: Math.max(DEAL_UPLOAD_LIMIT.brief - attached.length, 0),
    requestSlot: useCallback(
      request => {
        const dealId = draftIdRef.current;
        if (!dealId) return Promise.reject(new Error('brief upload without a draft'));
        return requestSlot({ dealId, request }).unwrap();
      },
      [requestSlot],
    ),
  });

  // A finished upload is not in the brief until the draft confirms it.
  const completing = useRef(new Set<string>());
  const { entries, remove: dropUpload } = uploads;
  useEffect(() => {
    const dealId = draftIdRef.current;
    if (!dealId) return;
    entries.forEach(entry => {
      if (entry.status !== 'done' || !entry.fileId || completing.current.has(entry.key)) return;
      completing.current.add(entry.key);
      completeAttachment({ dealId, fileId: entry.fileId })
        .unwrap()
        .then(
          file => setAttached(prev => [...prev, file]),
          () => toastService.error(t('marketplace.offer.brief.files.failed')),
        )
        .finally(() => {
          completing.current.delete(entry.key);
          dropUpload(entry.key);
        });
    });
  }, [completeAttachment, dropUpload, entries, t]);

  const restore = useCallback((files: readonly DealFile[]) => setAttached([...files]), []);

  const removeFile = useCallback(
    (file: DealFile) => {
      const dealId = draftIdRef.current;
      if (!dealId) return;
      setAttached(prev => prev.filter(entry => entry.id !== file.id));
      removeAttachment({ dealId, fileId: file.id })
        .unwrap()
        .catch(() => {
          setAttached(prev => (prev.some(entry => entry.id === file.id) ? prev : [...prev, file]));
          toastService.error(t('marketplace.offer.brief.files.failed'));
        });
    },
    [removeAttachment, t],
  );

  const { add, remaining } = uploads;
  const addSources = useCallback(
    (sources: UploadSource[]) => {
      if (sources.length === 0) return;
      if (add(sources) > 0) {
        toastService.info(t('marketplace.offer.brief.files.limit', { max: DEAL_UPLOAD_LIMIT.brief }));
      }
    },
    [add, t],
  );

  const pickFrom = useCallback(
    async (source: BriefFileSource) => {
      if (remaining <= 0) {
        toastService.info(t('marketplace.offer.brief.files.limit', { max: DEAL_UPLOAD_LIMIT.brief }));
        return;
      }
      try {
        if (source === 'photos') {
          // Original quality: reference images are never recompressed (rule 07).
          const response = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: remaining });
          if (response.didCancel) return;
          if (response.errorCode) throw new Error(response.errorCode);
          addSources(
            (response.assets ?? []).flatMap(asset =>
              asset.uri
                ? [{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]
                : [],
            ),
          );
          return;
        }
        const files = await pick({ type: [types.pdf, types.images], allowMultiSelection: true });
        addSources(files.map(file => ({ uri: file.uri, name: file.name ?? file.uri, mime: file.type, size: file.size })));
      } catch (err) {
        if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
        toastService.error(t('marketplace.offer.brief.files.failed'));
      }
    },
    [addSources, remaining, t],
  );

  const rows = useMemo<BriefFileRow[]>(
    () => [
      ...attached.map<BriefFileRow>(file => ({ kind: 'attached', key: file.id, file })),
      ...entries.map<BriefFileRow>(entry => ({ kind: 'upload', key: entry.key, entry })),
    ],
    [attached, entries],
  );

  return {
    rows,
    count: attached.length + entries.length,
    isUploading: uploads.isUploading || entries.some(entry => entry.status === 'done'),
    canAdd: remaining > 0,
    pickFrom,
    retry: uploads.retry,
    removeUpload: dropUpload,
    removeFile,
    restore,
  };
};

export type BriefAttachmentsModel = ReturnType<typeof useBriefAttachments>;
