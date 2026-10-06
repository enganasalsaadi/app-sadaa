import { createIdempotencyKey, normalizeApiError } from '@/core/api';
import type { ShareChannel } from '../types/mediaKit';

const SRC_PARAM = /([?&])src=[^&#]*/;

/** Contract §17.8: the shared link always carries `?src=link` so opens are attributed. */
export const buildShareUrl = (publicUrl: string): string => {
  const [base = '', hash] = publicUrl.split('#', 2);
  let url: string;
  if (SRC_PARAM.test(base)) {
    url = base.replace(SRC_PARAM, '$1src=link');
  } else {
    url = `${base}${base.includes('?') ? '&' : '?'}src=link`;
  }
  return hash === undefined ? url : `${url}#${hash}`;
};

/**
 * Maps the OS share result to a contract channel. `null` = the user dismissed
 * the sheet, so nothing was shared and nothing is recorded. Android never
 * reports the chosen target → always `other`; iOS reports `activityType`.
 */
export const resolveShareChannel = (
  os: 'ios' | 'android' | 'other',
  result: { action: string; activityType?: string | null },
): ShareChannel | null => {
  if (result.action === 'dismissedAction') {
    return null;
  }
  if (os !== 'ios') {
    return 'other';
  }
  const target = (result.activityType ?? '').toLowerCase();
  if (target.includes('whatsapp')) {
    return 'whatsapp';
  }
  if (target.includes('telegra')) {
    return 'telegram';
  }
  return 'other';
};

export type MediaKitShareError = 'private' | 'rate_limited' | 'failed';

/** `failed` (network / 5xx) is the only retryable one. */
export const classifyShareError = (error: unknown): MediaKitShareError => {
  const { code, statusCode } = normalizeApiError(error);
  if (code === 'media_kit_private') {
    return 'private';
  }
  if (statusCode === 429 || code === 'too_many_requests') {
    return 'rate_limited';
  }
  return 'failed';
};

export interface ShareAttempt {
  channel: ShareChannel;
  /** One per user tap; kept on retry so the server counts the share once. */
  idempotencyKey: string;
}

/**
 * Owns the idempotency-key lifecycle: `begin` mints a key for a new tap (before the OS sheet opens),
 * `fail` keeps the attempt for a retry (same key), anything else drops it.
 */
export const createShareAttempts = (newKey: () => string = createIdempotencyKey) => {
  let pending: ShareAttempt | null = null;
  return {
    begin(): string {
      pending = null;
      return newKey();
    },
    fail(attempt: ShareAttempt) {
      pending = attempt;
    },
    clear() {
      pending = null;
    },
    getPending: (): ShareAttempt | null => pending,
  };
};
