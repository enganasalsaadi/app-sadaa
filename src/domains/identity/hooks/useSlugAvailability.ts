import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLazyCheckMediaKitSlugQuery } from '../api/mediaKitApi';
import type { SlugReason } from '../types/mediaKit';
import { validateSlugLocally } from '../utils/mediaKitSlug';

/** Contract §17.3: debounce typing so the 30/min throttle is never hit by a normal edit. */
export const SLUG_CHECK_DEBOUNCE_MS = 400;

export type SlugAvailability =
  | { status: 'unchanged' }
  | { status: 'invalid'; reason: SlugReason }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason: SlugReason }
  /** The check itself failed (offline, 429): saving still works, the server decides. */
  | { status: 'unknown' };

interface CheckResult {
  slug: string;
  run: number;
  availability: SlugAvailability;
}

/**
 * Live availability of `slug` (already normalised) against the creator's
 * `currentSlug`. Shape errors are answered locally without a request; every
 * other value is checked after a pause in typing, uncached, and a reply for an
 * older value is dropped. `recheck` re-asks for the same value (save race).
 */
export const useSlugAvailability = (slug: string, currentSlug: string | null) => {
  const [checkSlug] = useLazyCheckMediaKitSlugQuery();
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);

  const isUnchanged = currentSlug === null || slug === currentSlug;
  const localReason = isUnchanged ? null : validateSlugLocally(slug);
  const needsCheck = !isUnchanged && localReason === null;

  useEffect(() => {
    if (!needsCheck) {
      return undefined;
    }
    let active = true;
    let request: ReturnType<typeof checkSlug> | null = null;
    const settle = (availability: SlugAvailability) => {
      if (active) setResult({ slug, run, availability });
    };
    const timer = setTimeout(() => {
      request = checkSlug(slug);
      request
        .unwrap()
        .then(check =>
          settle(
            check.available
              ? { status: 'available' }
              : { status: 'unavailable', reason: check.reason ?? 'taken' },
          ),
        )
        .catch(() => settle({ status: 'unknown' }));
    }, SLUG_CHECK_DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
      request?.abort();
    };
  }, [checkSlug, needsCheck, run, slug]);

  const recheck = useCallback(() => setRun(n => n + 1), []);

  const availability = useMemo<SlugAvailability>(() => {
    if (isUnchanged) return { status: 'unchanged' };
    if (localReason) return { status: 'invalid', reason: localReason };
    return result && result.slug === slug && result.run === run
      ? result.availability
      : { status: 'checking' };
  }, [isUnchanged, localReason, result, run, slug]);

  return { availability, recheck };
};
