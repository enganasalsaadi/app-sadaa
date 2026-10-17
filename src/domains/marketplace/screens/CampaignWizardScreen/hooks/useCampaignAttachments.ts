import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadSource } from '@/core/upload';
import {
  useCompleteCampaignFileMutation,
  useRemoveCampaignFileMutation,
  useRequestCampaignFileSlotMutation,
} from '../../../api/brandCampaignsApi';
import { CAMPAIGN_UPLOAD_LIMIT, CAMPAIGN_UPLOAD_POLICY } from '../../../constants/campaignUploads';
import type { CampaignFile } from '../../../types/campaign';
import { pickBriefSources, type BriefFileRow, type BriefFileSource } from '../../../utils/briefFiles';

/**
 * The campaign's brief attachments (≤ 5 images / PDFs, contract §3.2 Files). The campaign detail is
 * the source of truth for the files that joined; a pick uploads to the draft's signed slot, then
 * is confirmed and shows up there (the confirm and the delete both patch the cached campaign).
 */
export const useCampaignAttachments = (campaignId: string | null, attached: readonly CampaignFile[]) => {
  const { t } = useTranslation();
  const [requestSlot] = useRequestCampaignFileSlotMutation();
  const [completeFile] = useCompleteCampaignFileMutation();
  const [removeCampaignFile] = useRemoveCampaignFileMutation();
  // Files being deleted stay hidden until the server answers; a failure brings them back.
  const [removing, setRemoving] = useState<readonly string[]>([]);
  const idRef = useRef(campaignId);
  idRef.current = campaignId;

  const visible = useMemo(() => attached.filter(file => !removing.includes(file.id)), [attached, removing]);

  const uploads = useFileUploads({
    policy: CAMPAIGN_UPLOAD_POLICY.brief,
    limit: Math.max(CAMPAIGN_UPLOAD_LIMIT.brief - attached.length, 0),
    requestSlot: useCallback(
      request => {
        const id = idRef.current;
        if (!id) return Promise.reject(new Error('brief upload without a draft'));
        return requestSlot({ id, purpose: 'brief', request }).unwrap();
      },
      [requestSlot],
    ),
  });

  // A finished upload is not in the brief until the campaign confirms it.
  const confirming = useRef(new Set<string>());
  const { entries, remove: dropUpload, add, remaining } = uploads;
  useEffect(() => {
    const id = idRef.current;
    if (!id) return;
    entries.forEach(entry => {
      if (entry.status !== 'done' || !entry.fileId || confirming.current.has(entry.key)) return;
      confirming.current.add(entry.key);
      completeFile({ id, fileId: entry.fileId })
        .unwrap()
        .catch(() => toastService.error(t('marketplace.offer.brief.files.failed')))
        .finally(() => {
          confirming.current.delete(entry.key);
          dropUpload(entry.key);
        });
    });
  }, [completeFile, dropUpload, entries, t]);

  const removeFile = useCallback(
    (fileId: string) => {
      const id = idRef.current;
      if (!id) return;
      setRemoving(prev => [...prev, fileId]);
      removeCampaignFile({ id, fileId })
        .unwrap()
        .catch(() => toastService.error(t('marketplace.offer.brief.files.failed')))
        .finally(() => setRemoving(prev => prev.filter(entry => entry !== fileId)));
    },
    [removeCampaignFile, t],
  );

  const addSources = useCallback(
    (sources: UploadSource[]) => {
      if (sources.length === 0) return;
      if (add(sources) > 0) {
        toastService.info(t('marketplace.offer.brief.files.limit', { max: CAMPAIGN_UPLOAD_LIMIT.brief }));
      }
    },
    [add, t],
  );

  const pickFrom = useCallback(
    async (source: BriefFileSource) => {
      if (remaining <= 0) {
        toastService.info(t('marketplace.offer.brief.files.limit', { max: CAMPAIGN_UPLOAD_LIMIT.brief }));
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
      ...visible.map<BriefFileRow>(file => ({ kind: 'attached', key: file.id, file })),
      ...entries.map<BriefFileRow>(entry => ({ kind: 'upload', key: entry.key, entry })),
    ],
    [entries, visible],
  );

  return {
    rows,
    count: visible.length + entries.length,
    /** A file is on its way (sending or being confirmed). */
    busy: uploads.isUploading || entries.some(entry => entry.status === 'done'),
    canAdd: remaining > 0,
    pickFrom,
    retry: uploads.retry,
    removeUpload: dropUpload,
    removeFile,
  };
};

export type CampaignAttachmentsModel = ReturnType<typeof useCampaignAttachments>;
