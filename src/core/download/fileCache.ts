import ReactNativeBlobUtil from 'react-native-blob-util';
import { safeFileName } from './fileKind';
import type { DownloadFailure, RemoteFile } from './downloadTypes';

// Videos run up to 300 MB; a slow line needs minutes, not the default 60 s.
const DOWNLOAD_TIMEOUT_MS = 20 * 60 * 1000;
const PROGRESS_INTERVAL_MS = 250;
const PARTIAL_SUFFIX = '.part';

/** App-private, the OS may clear it; emptied on sign-out (deal files are the user's data). */
const cacheDir = (): string => `${ReactNativeBlobUtil.fs.dirs.CacheDir}/sada-files`;

/** One folder per file id: two files with the same name never overwrite each other. */
export const cachePathFor = (file: RemoteFile): string =>
  `${cacheDir()}/${safeFileName(file.id, '')}/${safeFileName(file.name, file.mime)}`;

/** Carries no URL or file name: safe to report. */
export class DownloadError extends Error {
  readonly failure: DownloadFailure;

  constructor(failure: DownloadFailure) {
    super(`download_${failure}`);
    this.name = 'DownloadError';
    this.failure = failure;
  }
}

export const isDownloadError = (value: unknown): value is DownloadError =>
  value instanceof DownloadError;

export interface CacheTask {
  promise: Promise<string>;
  cancel(): void;
}

// A signed link past its life answers 400/401/403 from the storage host; 404/410 = purged.
const failureForStatus = (status: number): DownloadFailure =>
  status === 404 || status === 410 ? 'gone' : status >= 400 && status < 500 ? 'expired' : 'network';

const ensureDir = async (path: string): Promise<void> => {
  const dir = path.slice(0, path.lastIndexOf('/'));
  if (!(await ReactNativeBlobUtil.fs.exists(dir))) await ReactNativeBlobUtil.fs.mkdir(dir);
};

const removeQuietly = (path: string): Promise<void> =>
  ReactNativeBlobUtil.fs.unlink(path).catch(() => undefined);

/**
 * Streams the file to the cache (never through JS memory) and resolves its path. Already cached →
 * resolves at once. Writes to `.part` first, so a dropped line never leaves a half file that looks done.
 */
export const fetchToCache = (
  file: RemoteFile,
  url: string,
  onProgress?: (progress: number) => void,
): CacheTask => {
  const path = cachePathFor(file);
  const partial = `${path}${PARTIAL_SUFFIX}`;
  let canceled = false;
  let cancelFetch: (() => void) | null = null;

  const run = async (): Promise<string> => {
    if (await ReactNativeBlobUtil.fs.exists(path)) return path;
    await ensureDir(path);
    if (canceled) throw new DownloadError('canceled');

    const task = ReactNativeBlobUtil.config({ path: partial, timeout: DOWNLOAD_TIMEOUT_MS }).fetch('GET', url);
    cancelFetch = () => task.cancel();
    if (onProgress) {
      task.progress({ interval: PROGRESS_INTERVAL_MS }, (received, total) => {
        const totalBytes = Number(total) > 0 ? Number(total) : (file.size ?? 0);
        if (totalBytes > 0) onProgress(Math.min(Number(received) / totalBytes, 1));
      });
    }

    let status: number;
    try {
      const response = await task;
      status = response.info().status;
    } catch {
      await removeQuietly(partial);
      throw new DownloadError(canceled ? 'canceled' : 'network');
    }
    if (status < 200 || status >= 300) {
      await removeQuietly(partial);
      throw new DownloadError(failureForStatus(status));
    }
    try {
      await ReactNativeBlobUtil.fs.mv(partial, path);
    } catch {
      await removeQuietly(partial);
      throw new DownloadError('storage');
    }
    onProgress?.(1);
    return path;
  };

  return {
    promise: run(),
    cancel: () => {
      canceled = true;
      cancelFetch?.();
    },
  };
};

/** Sign-out: nothing of the last user's deals stays on the device. */
export const clearFileCache = async (): Promise<void> => {
  const dir = cacheDir();
  if (await ReactNativeBlobUtil.fs.exists(dir)) await removeQuietly(dir);
};
