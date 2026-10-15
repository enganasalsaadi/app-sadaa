import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { normalizeApiError } from '@/core/api';
import { isRetryableFailure, type UploadEntry, type UploadStatus } from '@/core/upload';
import { formatFileSize } from '@/shared/utils';

/** One picked evidence file in the sheet, while it uploads and after. */
export interface EvidenceFile {
  key: string;
  uri: string;
  name: string;
  kind: 'image' | 'video' | 'document';
  status: UploadStatus;
  progress: number;
  failure: string | null;
  retryable: boolean;
}

const kindOf = (mime: string | null): EvidenceFile['kind'] => {
  if (mime?.startsWith('image/')) return 'image';
  if (mime?.startsWith('video/')) return 'video';
  return 'document';
};

const failureText = (t: TFunction, entry: UploadEntry): string | null => {
  switch (entry.failure) {
    case null:
    case 'canceled':
      return null;
    case 'type':
      return t('marketplace.deals.dispute.evidence.fileType');
    case 'size':
      return t('marketplace.deals.dispute.evidence.fileSize', {
        size: entry.maxBytes ? formatFileSize(entry.maxBytes) : '',
      });
    case 'empty':
      return t('marketplace.deals.dispute.evidence.fileEmpty');
    case 'slot':
      // The server's own words (`deal_upload_limit`, a dispute that moved on…).
      return normalizeApiError(entry.cause).message;
    case 'transfer':
      return t('marketplace.deals.dispute.evidence.fileFailed');
    default: {
      const _exhaustive: never = entry.failure;
      return _exhaustive;
    }
  }
};

export const useEvidenceFiles = (entries: readonly UploadEntry[]): EvidenceFile[] => {
  const { t } = useTranslation();
  return useMemo(
    () =>
      entries.map(entry => ({
        key: entry.key,
        uri: entry.source.uri,
        name: entry.source.name,
        kind: kindOf(entry.source.mime),
        status: entry.status,
        progress: entry.progress,
        failure: failureText(t, entry),
        retryable: entry.failure !== null && isRetryableFailure(entry.failure),
      })),
    [entries, t],
  );
};
