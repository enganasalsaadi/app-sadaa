import { useCallback, useEffect, useRef, useState } from 'react';
import { extractServerFieldErrors, normalizeApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { useLookupSocialProfileMutation } from '../api';
import type { InfluencerPlatform } from '../schemas';
import { outcomeFromError, outcomeFromResult } from '../utils/socialLookup';
import type { LookupOutcome } from '../utils/socialLookup';

export type LookupState = { kind: 'idle' } | { kind: 'checking' } | LookupOutcome;

const IDLE: LookupState = { kind: 'idle' };
const CHECKING: LookupState = { kind: 'checking' };

/**
 * One `/social/lookup` at a time (up to 30 s, may spend provider credits).
 * A newer check, `reset` or unmount aborts the one in flight, so a late
 * answer never lands on a handle the user already changed.
 */
export const useSocialLookup = () => {
  const [lookupProfile] = useLookupSocialProfileMutation();
  const [state, setState] = useState<LookupState>(IDLE);
  const requestRef = useRef<{ abort: () => void } | null>(null);

  const cancel = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const reset = useCallback(() => {
    cancel();
    setState(IDLE);
  }, [cancel]);

  /** Resolves the outcome, or `null` when superseded. */
  const check = useCallback(
    async (platform: InfluencerPlatform, handle: string): Promise<LookupOutcome | null> => {
      cancel();
      const request = lookupProfile({ platform, handle });
      requestRef.current = request;
      setState(CHECKING);
      let outcome: LookupOutcome;
      try {
        outcome = outcomeFromResult(await request.unwrap());
      } catch (err) {
        outcome = outcomeFromError(
          normalizeApiError(err),
          extractServerFieldErrors(err),
          Date.now(),
        );
      }
      if (requestRef.current !== request) return null;
      requestRef.current = null;
      setState(outcome);
      return outcome;
    },
    [cancel, lookupProfile],
  );

  const throttleSeconds = useCountdown(state.kind === 'throttled' ? state.until : null);

  return { state, check, reset, throttleSeconds };
};
