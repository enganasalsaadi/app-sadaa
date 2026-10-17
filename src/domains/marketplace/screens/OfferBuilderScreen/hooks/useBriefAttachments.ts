import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadSource } from '@/core/upload';
import {
  useCompleteBriefAttachmentMutation,
  useRemoveBriefAttachmentMutation,
  useRequestBriefAttachmentSlotMutation,
} from '../../../api/dealOfferApi';
import { DEAL_UPLOAD_LIMIT, DEAL_UPLOAD_POLICY } from '../../../constants/dealUploads';
import type { DealFile } from '../../../types/deal';
import { pickBriefSources, type BriefFileRow, type BriefFileSource } from '../../../utils/briefFiles';

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
    (fileId: string) => {
      const dealId = draftIdRef.current;
      const file = attached.find(entry => entry.id === fileId);
      if (!dealId || !file) return;
      setAttached(prev => prev.filter(entry => entry.id !== fileId));
      removeAttachment({ dealId, fileId })
        .unwrap()
        .catch(() => {
          setAttached(prev => (prev.some(entry => entry.id === fileId) ? prev : [...prev, file]));
          toastService.error(t('marketplace.offer.brief.files.failed'));
        });
    },
    [attached, removeAttachment, t],
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
        addSources(await pickBriefSources(source, remaining));
      } catch {
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
