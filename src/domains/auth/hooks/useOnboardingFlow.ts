import { useCallback, useRef, useState } from 'react';
import { normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';

export interface RunStepOptions {
  /** Return true when the error was shown on form fields (422) — skips the banner. */
  onFieldErrors?: (error: unknown) => boolean;
}

interface OnboardingFlowConfig<Step extends string> {
  current: Step;
  /** Fresh GET /onboarding/progress, resolved to the next step. */
  loadNextStep: () => Promise<Step | 'complete'>;
  goTo: (next: Step | 'complete') => void;
}

// Server-side step that didn't move after a successful write.
const STEP_NOT_ADVANCED = { data: { message: null }, status: 409 };

/**
 * Drives one wizard screen for any role: run its write, re-read progress
 * (the only source of truth, rule 06), then go wherever the server says.
 *
 * If the write succeeded but the progress read failed, a retry re-runs only
 * the read, never the write (an OTP can't be verified twice).
 */
export const useOnboardingFlow = <Step extends string>({
  current,
  loadNextStep,
  goTo,
}: OnboardingFlowConfig<Step>) => {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);
  const inFlightRef = useRef(false);
  const writeDoneRef = useRef(false);

  const runStep = useCallback(
    /** Resolves false when the step failed (error is set), true otherwise. */
    async (write: () => Promise<unknown>, options?: RunStepOptions): Promise<boolean> => {
      // A second tap while running is ignored, not an error.
      if (inFlightRef.current) return true;
      inFlightRef.current = true;
      setIsBusy(true);
      setError(null);
      try {
        if (!writeDoneRef.current) {
          await write();
          writeDoneRef.current = true;
        }
        const next = await loadNextStep();
        if (next === current) throw STEP_NOT_ADVANCED;
        writeDoneRef.current = false;
        goTo(next);
        return true;
      } catch (err) {
        if (err === STEP_NOT_ADVANCED) writeDoneRef.current = false;
        if (!options?.onFieldErrors?.(err)) setError(normalizeApiError(err));
        return false;
      } finally {
        inFlightRef.current = false;
        setIsBusy(false);
      }
    },
    [current, loadNextStep, goTo],
  );

  const clearError = useCallback(() => setError(null), []);

  return { runStep, isBusy, error, clearError };
};
