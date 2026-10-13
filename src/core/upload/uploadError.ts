import type { UploadFailure } from './uploadTypes';

/** Carries no file name, URL or size: safe to report. */
export class UploadError extends Error {
  readonly failure: UploadFailure;
  /** The underlying API / native error (`slot`, `transfer`). */
  readonly cause: unknown;
  /** The cap that was exceeded (`size`). */
  readonly maxBytes: number | null;

  constructor(failure: UploadFailure, options: { cause?: unknown; maxBytes?: number } = {}) {
    super(`upload_${failure}`);
    this.name = 'UploadError';
    this.failure = failure;
    this.cause = options.cause;
    this.maxBytes = options.maxBytes ?? null;
  }
}

export const isUploadError = (value: unknown): value is UploadError => value instanceof UploadError;

/** Retrying a type/size rejection gives the same answer; a cancel is the user's choice. */
export const isRetryableFailure = (failure: UploadFailure): boolean =>
  failure === 'slot' || failure === 'transfer';
