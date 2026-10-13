import ReactNativeBlobUtil from 'react-native-blob-util';
import { UploadError } from './uploadError';
import { checkUpload, normalizeMime } from './uploadPolicy';
import { toSlotRequest } from './uploadSlot';
import { putFile, toNativePath } from './putFile';
import type { RequestUploadSlot, UploadPolicy, UploadSlot, UploadSource } from './uploadTypes';

export interface UploadFileOptions {
  source: UploadSource;
  policy: UploadPolicy;
  requestSlot: RequestUploadSlot;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

const readSize = async (uri: string): Promise<number> => {
  try {
    const stat = await ReactNativeBlobUtil.fs.stat(toNativePath(uri));
    return Number(stat.size);
  } catch (error) {
    throw new UploadError('transfer', { cause: error });
  }
};

const throwIfAborted = (signal: AbortSignal | undefined) => {
  if (signal?.aborted) throw new UploadError('canceled');
};

/**
 * The 3-step upload (contract: drafts, proofs, evidence, retention, brief): check → slot →
 * PUT → `file_id` for the submit call. A retry must call this again: a fresh slot each time.
 * Rejects only with `UploadError`.
 */
export const uploadFile = async ({
  source,
  policy,
  requestSlot,
  onProgress,
  signal,
}: UploadFileOptions): Promise<string> => {
  const mime = normalizeMime(source.mime, source.name);
  const size = source.size ?? (await readSize(source.uri));
  const check = checkUpload(policy, mime, size);
  if (!check.ok) {
    throw new UploadError(check.failure, check.failure === 'size' ? { maxBytes: check.maxBytes } : {});
  }

  throwIfAborted(signal);
  let slot: UploadSlot;
  try {
    slot = await requestSlot(toSlotRequest(source.name, check.mime, size));
  } catch (error) {
    throw new UploadError('slot', { cause: error });
  }

  throwIfAborted(signal);
  onProgress?.(0);
  const put = putFile(slot, source.uri, onProgress);
  const onAbort = () => put.cancel();
  signal?.addEventListener('abort', onAbort);
  try {
    await put.promise;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
  return slot.fileId;
};
