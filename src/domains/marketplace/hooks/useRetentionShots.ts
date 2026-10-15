import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastService } from '@/core/toast';
import { useFileUploads, type RequestUploadSlot } from '@/core/upload';
import {
  DEAL_UPLOAD_LIMIT,
  DEAL_UPLOAD_POLICY,
} from '../constants/dealUploads';
import { pickScreenshots } from '../utils/dealScreenshots';
import { useProofFrames } from './useProofFrames';

type RetentionPurpose = 'retention_report' | 'retention_restore';

/**
 * The 1–3 screenshots of a retention report or restore (B10: images only, at least one), uploaded
 * as they're picked. `ready()` says whether the set can go now, and why not (under the row, or a
 * toast while files are still on their way).
 */
export const useRetentionShots = (
  purpose: RetentionPurpose,
  requestSlot: RequestUploadSlot,
) => {
  const { t } = useTranslation();
  const max = DEAL_UPLOAD_LIMIT[purpose];
  const uploads = useFileUploads({
    policy: DEAL_UPLOAD_POLICY[purpose],
    limit: max,
    requestSlot,
  });
  const frames = useProofFrames(uploads.entries);
  const [error, setError] = useState<string | null>(null);

  const { add, remaining } = uploads;
  const limitToast = useCallback(
    () =>
      toastService.info(
        t('marketplace.deals.publish.creator.proofs.limit', { max }),
      ),
    [max, t],
  );
  const pick = useCallback(async () => {
    if (remaining <= 0) {
      limitToast();
      return;
    }
    try {
      const sources = await pickScreenshots(remaining);
      if (sources.length === 0) return;
      setError(null);
      if (add(sources) > 0) limitToast();
    } catch {
      toastService.error(
        t('marketplace.deals.publish.creator.proofs.pickFailed'),
      );
    }
  }, [add, limitToast, remaining, t]);

  const { entries, isUploading, hasFailed } = uploads;
  const ready = useCallback((): boolean => {
    if (entries.length === 0) {
      setError(t('marketplace.deals.publish.creator.proofs.required'));
      return false;
    }
    if (isUploading) {
      toastService.info(t('marketplace.deals.retention.shots.waiting'));
      return false;
    }
    if (hasFailed) {
      setError(t('marketplace.deals.retention.shots.fix'));
      return false;
    }
    return true;
  }, [entries.length, hasFailed, isUploading, t]);

  /** With the other fields' errors: an empty set says so at the same time. */
  const flagMissing = useCallback(() => {
    if (entries.length === 0)
      setError(t('marketplace.deals.publish.creator.proofs.required'));
  }, [entries.length, t]);

  const clearUploads = uploads.clear;
  const reset = useCallback(() => {
    clearUploads();
    setError(null);
  }, [clearUploads]);

  return {
    frames,
    max,
    error,
    setError,
    pick,
    remove: uploads.remove,
    retry: uploads.retry,
    fileIds: uploads.fileIds,
    ready,
    flagMissing,
    reset,
  };
};

export type RetentionShotsModel = ReturnType<typeof useRetentionShots>;
