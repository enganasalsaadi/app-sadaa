import ReactNativeBlobUtil from 'react-native-blob-util';
import { UploadError } from './uploadError';
import type { UploadSlot } from './uploadTypes';

// The slot stays valid 30 min; a 300 MB video on a slow line needs most of it.
const UPLOAD_TIMEOUT_MS = 30 * 60 * 1000;
const PROGRESS_INTERVAL_MS = 250;

export interface PutTask {
  promise: Promise<void>;
  cancel(): void;
}

/** blob-util streams from a filesystem path; `content://` URIs pass through unchanged. */
export const toNativePath = (uri: string): string =>
  uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;

/**
 * Step 2: streams the file from disk (never loaded into JS memory) to the signed URL with
 * exactly the slot's headers. Progress 0–1. Rejects with `UploadError('transfer' | 'canceled')`.
 */
export const putFile = (
  slot: UploadSlot,
  uri: string,
  onProgress?: (progress: number) => void,
): PutTask => {
  let canceled = false;
  const task = ReactNativeBlobUtil.config({ timeout: UPLOAD_TIMEOUT_MS }).fetch(
    'PUT',
    slot.url,
    { ...slot.headers },
    ReactNativeBlobUtil.wrap(toNativePath(uri)),
  );

  if (onProgress) {
    task.uploadProgress({ interval: PROGRESS_INTERVAL_MS }, (sent, total) => {
      const sentBytes = Number(sent);
      const totalBytes = Number(total);
      if (totalBytes > 0) onProgress(Math.min(sentBytes / totalBytes, 1));
    });
  }

  const promise = task.then(
    response => {
      const status = response.info().status;
      if (status < 200 || status >= 300) throw new UploadError('transfer', { cause: status });
      onProgress?.(1);
    },
    (error: unknown) => {
      throw new UploadError(canceled ? 'canceled' : 'transfer', { cause: error });
    },
  );

  return {
    promise,
    cancel: () => {
      canceled = true;
      task.cancel();
    },
  };
};
