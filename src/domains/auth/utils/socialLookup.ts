import type { AppApiError } from '@/core/api';
import type { SocialLookupProfile, SocialLookupResult } from '../store';

/** What the add-account sheet shows after a lookup (contract §4, §14). */
export type LookupOutcome =
  | { kind: 'found'; profile: SocialLookupProfile }
  /** Linked to another influencer: the handle cannot be added. */
  | { kind: 'claimed' }
  | { kind: 'notFound' }
  /** Provider down, timeout or credits out: manual tier, reviewed later. */
  | { kind: 'unavailable' }
  /** No lookup for this platform after all: manual tier, no message. */
  | { kind: 'manual' }
  | { kind: 'throttled'; until: number }
  /** 422 on `handle`: the server's message goes under the field. */
  | { kind: 'invalid'; message: string };

export const outcomeFromResult = (result: SocialLookupResult): LookupOutcome => {
  if (result.already_claimed) return { kind: 'claimed' };
  switch (result.status) {
    case 'found':
      return result.profile ? { kind: 'found', profile: result.profile } : { kind: 'unavailable' };
    case 'not_found':
      return { kind: 'notFound' };
    case 'unavailable':
      return { kind: 'unavailable' };
    case 'manual_required':
      return { kind: 'manual' };
    // A status this build doesn't know yet: the manual tier always works.
    default:
      return { kind: 'unavailable' };
  }
};

type LookupError = Pick<AppApiError, 'statusCode' | 'code' | 'retryAfter'>;

/** Any failure falls back to a manual tier; only a bad handle blocks. */
export const outcomeFromError = (
  error: LookupError,
  fieldErrors: Record<string, string> | null,
  now: number,
): LookupOutcome => {
  const handleError = fieldErrors?.handle;
  if (handleError) return { kind: 'invalid', message: handleError };
  if (error.statusCode === 429 && error.retryAfter) {
    return { kind: 'throttled', until: now + error.retryAfter * 1000 };
  }
  return { kind: 'unavailable' };
};

const ROW_ERROR_KEY = /^platforms\.(\d+)\.\w+$/;

/** Step-2 422 keys `platforms.N.*` → the message for each platform's row. */
export const platformRowErrors = <TPlatform extends string>(
  fieldErrors: Record<string, string> | null,
  platforms: readonly TPlatform[],
): Partial<Record<TPlatform, string>> => {
  const rows: Partial<Record<TPlatform, string>> = {};
  for (const [key, message] of Object.entries(fieldErrors ?? {})) {
    const index = ROW_ERROR_KEY.exec(key)?.[1];
    const platform = index === undefined ? undefined : platforms[Number(index)];
    if (platform && rows[platform] === undefined) rows[platform] = message;
  }
  return rows;
};
