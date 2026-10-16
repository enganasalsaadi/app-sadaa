import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadEntry } from '@/core/upload';
import {
  useCompleteCampaignFileMutation,
  useRemoveCampaignFileMutation,
  useRequestCampaignFileSlotMutation,
} from '../../../api/brandCampaignsApi';
import { CAMPAIGN_UPLOAD_LIMIT, CAMPAIGN_UPLOAD_POLICY } from '../../../constants/campaignUploads';
import type { CampaignFile } from '../../../types/campaign';

/**
 * The campaign's one cover image (contract §3.2 Files): the picked photo uploads to the draft's
 * signed slot, then is confirmed and replaces the cover (the server deletes the old one). While it
 * is on its way the screen shows the local photo with progress; a failed one keeps its photo so it
 * can be retried or dropped.
 */
export const useCampaignCover = (campaignId: string | null, cover: CampaignFile | null) => {
  const { t } = useTranslation();
  const [requestSlot] = useRequestCampaignFileSlotMutation();
  const [completeFile] = useCompleteCampaignFileMutation();
  const [removeFile] = useRemoveCampaignFileMutation();
  const [removing, setRemoving] = useState(false);
  const idRef = useRef(campaignId);
  idRef.current = campaignId;

  const uploads = useFileUploads({
    policy: CAMPAIGN_UPLOAD_POLICY.cover,
    limit: CAMPAIGN_UPLOAD_LIMIT.cover,
    requestSlot: useCallback(
      request => {
        const id = idRef.current;
        if (!id) return Promise.reject(new Error('cover upload without a draft'));
        return requestSlot({ id, purpose: 'cover', request }).unwrap();
      },
      [requestSlot],
    ),
  });

  // A finished upload is not the cover until the campaign confirms it.
  const confirming = useRef(new Set<string>());
  const { entries, remove: dropUpload, clear, add, retry } = uploads;
  useEffect(() => {
    const id = idRef.current;
    if (!id) return;
    entries.forEach(entry => {
      if (entry.status !== 'done' || !entry.fileId || confirming.current.has(entry.key)) return;
      confirming.current.add(entry.key);
      completeFile({ id, fileId: entry.fileId })
        .unwrap()
        .then(
          () => dropUpload(entry.key),
          () => toastService.error(t('marketplace.campaign.wizard.idea.cover.failed')),
        )
        .finally(() => confirming.current.delete(entry.key));
    });
  }, [completeFile, dropUpload, entries, t]);

  const pick = useCallback(async () => {
    try {
      // Original quality: the cover is shown as picked (rule 07).
      const response = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorCode);
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      clear();
      add([{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]);
    } catch {
      toastService.error(t('marketplace.campaign.wizard.idea.cover.failed'));
    }
  }, [add, clear, t]);

  const removeCover = useCallback(async () => {
    const id = idRef.current;
    if (!id || !cover || removing) return;
    setRemoving(true);
    try {
      await removeFile({ id, fileId: cover.id }).unwrap();
    } catch {
      toastService.error(t('marketplace.campaign.wizard.idea.cover.failed'));
    } finally {
      setRemoving(false);
    }
  }, [cover, removeFile, removing, t]);

  const upload: UploadEntry | null = entries[0] ?? null;
  const uploadKey = upload?.key ?? null;
  const discardUpload = useCallback(() => {
    if (uploadKey) dropUpload(uploadKey);
  }, [dropUpload, uploadKey]);
  const retryUpload = useCallback(() => {
    if (uploadKey) retry(uploadKey);
  }, [retry, uploadKey]);

  return {
    coverUrl: cover?.url ?? null,
    upload,
    /** A file is on its way (sending or being confirmed). */
    busy: upload !== null && upload.status !== 'failed',
    removing,
    pick,
    /** Drops the failed attempt (the previous cover, if any, stays). */
    discardUpload,
    retryUpload,
    removeCover,
  };
};

export type CampaignCoverModel = ReturnType<typeof useCampaignCover>;
