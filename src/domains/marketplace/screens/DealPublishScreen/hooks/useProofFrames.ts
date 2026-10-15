import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { normalizeApiError } from '@/core/api';
import { isRetryableFailure, type UploadEntry } from '@/core/upload';
import { formatFileSize } from '@/shared/utils';

export type ProofFrameStatus = 'done' | 'uploading' | 'failed';

/** One proof screenshot slot, from a picked file being uploaded. */
export interface ProofFrame {
  key: string;
  uri: string | null;
  status: ProofFrameStatus;
  progress: number;
  failure: string | null;
  retryable: boolean;
}

const failureText = (t: TFunction, entry: UploadEntry): string | null => {
  switch (entry.failure) {
    case null:
    case 'canceled':
      return null;
    case 'type':
      return t('marketplace.deals.publish.creator.proofs.type');
    case 'size':
      return t('marketplace.deals.publish.creator.proofs.size', {
        size: entry.maxBytes ? formatFileSize(entry.maxBytes) : '',
      });
    case 'empty':
      return t('marketplace.deals.publish.creator.proofs.empty');
    case 'slot':
      // The server's own words (`deal_upload_limit`, an item that moved on…).
      return normalizeApiError(entry.cause).message;
    case 'transfer':
      return t('marketplace.deals.publish.creator.proofs.failed');
    default: {
      const _exhaustive: never = entry.failure;
      return _exhaustive;
    }
  }
};

export const useProofFrames = (entries: readonly UploadEntry[]): ProofFrame[] => {
  const { t } = useTranslation();
  return useMemo(
    () =>
      entries.map(entry => ({
        key: entry.key,
        uri: entry.source.uri,
        status: entry.status,
        progress: entry.progress,
        failure: failureText(t, entry),
        retryable: entry.failure !== null && isRetryableFailure(entry.failure),
      })),
    [entries, t],
  );
};
