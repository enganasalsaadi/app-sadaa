import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { normalizeApiError } from '@/core/api';
import { isRetryableFailure, type UploadEntry } from '@/core/upload';
import { formatFileSize } from '@/shared/utils';
import type { DealFile } from '../../../types';
import type { DraftFrameStatus } from '../components/DraftFrame';

/** One frame of the contact sheet, from a file being picked/uploaded or one already handed in. */
export interface DraftSheetFrame {
  key: string;
  uri: string | null;
  kind: 'video' | 'image';
  status: DraftFrameStatus;
  progress: number;
  failure: string | null;
  retryable: boolean;
  durationSec: number | null;
}

const failureText = (t: TFunction, entry: UploadEntry): string | null => {
  switch (entry.failure) {
    case null:
    case 'canceled':
      return null;
    case 'type':
      return t('marketplace.deals.drafts.upload.sheet.type');
    case 'size':
      return t('marketplace.deals.drafts.upload.sheet.size', {
        size: entry.maxBytes ? formatFileSize(entry.maxBytes) : '',
      });
    case 'empty':
      return t('marketplace.deals.drafts.upload.sheet.empty');
    case 'slot':
      // The server's own words (`deal_upload_limit`, an item that moved on…).
      return normalizeApiError(entry.cause).message;
    case 'transfer':
      return t('marketplace.deals.drafts.upload.sheet.failed');
    default: {
      const _exhaustive: never = entry.failure;
      return _exhaustive;
    }
  }
};

/** The round being put together: each picked file with its upload state, in the post's order. */
export const useUploadFrames = (
  entries: readonly UploadEntry[],
  durations: Readonly<Record<string, number>>,
): DraftSheetFrame[] => {
  const { t } = useTranslation();
  return useMemo(
    () =>
      entries.map(entry => ({
        key: entry.key,
        uri: entry.source.uri,
        kind: entry.source.mime?.startsWith('video/') ? 'video' : 'image',
        status: entry.status,
        progress: entry.progress,
        failure: failureText(t, entry),
        retryable: entry.failure !== null && isRetryableFailure(entry.failure),
        durationSec: durations[entry.source.uri] ?? null,
      })),
    [durations, entries, t],
  );
};

/** A handed-in round, read only. */
export const useRoundFrames = (files: readonly DealFile[] | undefined): DraftSheetFrame[] =>
  useMemo(
    () =>
      (files ?? []).map(file => ({
        key: file.id,
        uri: file.url,
        kind: file.kind === 'video' ? 'video' : 'image',
        status: 'done',
        progress: 1,
        failure: null,
        retryable: false,
        durationSec: null,
      })),
    [files],
  );
