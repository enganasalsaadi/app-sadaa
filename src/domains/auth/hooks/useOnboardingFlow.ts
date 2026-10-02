import { useCallback, useRef, useState } from 'react';
import { normalizeApiError } from '@/core/api';
import type { ApiErrorCode, AppApiError } from '@/core/api';

export interface RunStepOptions {
  /** Return true when the error was shown on form fields (422) — skips the banner. */
  onFieldErrors?: (error: unknown) => boolean;
  /** The failure this step ends on (not called when it rerouted instead). */
  onFailure?: (error: AppApiError) => void;
  /**
   * A wrong-step rejection, yet progress still points at this step: return a
   * replacement write, or null to show the error. KYC uses it to resubmit as
   * a skip after a timed-out upload landed (contract §16).
   */
  resubmit?: (error: AppApiError) => (() => Promise<unknown>) | null;
}

interface OnboardingFlowConfig<Step extends string> {
  current: Step;
  /** Fresh GET /onboarding/progress, resolved to the next step. */
  loadNextStep: () => Promise<Step | 'complete'>;
  goTo: (next: Step | 'complete') => void;
}

// Local sentinel: the write succeeded but the server step didn't move. Never
// confused with a server 409 — it carries no `error_code`.
const STEP_NOT_ADVANCED = { data: { message: null }, status: 409 };

// Rejections meaning "you are on the wrong step", not "fix your input": the
// server already knows where the user belongs (contract §16). Out-of-order
// → re-read progress; kyc_already_* → an earlier timed-out upload landed;
// phone_not_verified → back to the OTP step.
const RESYNC_CODES: readonly ApiErrorCode[] = [
  'onboarding_step_out_of_order',
  'kyc_already_pending',
  'kyc_already_verified',
  'phone_not_verified',
];

/**
 * Drives one wizard screen for any role: run its write, re-read progress
 * (the only source of truth, rule 06), then go wherever the server says.
 *
 * If the write succeeded but the progress read failed, a retry re-runs only
 * the read, never the write (an OTP can't be verified twice). A wrong-step
 * rejection (`RESYNC_CODES`) re-reads progress and moves on instead of
 * showing an error, unless the server still points at this step.
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
    /** Resolves true only when this step's write was saved and the flow moved on. */
    async (write: () => Promise<unknown>, options?: RunStepOptions): Promise<boolean> => {
      // A second tap while running is ignored, not an error (and not a save).
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setIsBusy(true);
      setError(null);
      const advance = async () => {
        const next = await loadNextStep();
        if (next === current) throw STEP_NOT_ADVANCED;
        writeDoneRef.current = false;
        goTo(next);
        return true;
      };
      try {
        if (!writeDoneRef.current) {
          await write();
          writeDoneRef.current = true;
        }
        return await advance();
      } catch (err) {
        let failure = err;
        const apiError = normalizeApiError(err);
        if (err === STEP_NOT_ADVANCED) {
          writeDoneRef.current = false;
        } else if (apiError.code && RESYNC_CODES.includes(apiError.code)) {
          const next = await loadNextStep().catch(() => null);
          if (next !== null && next !== current) {
            goTo(next);
            return false;
          }
          const fallback = next === current ? options?.resubmit?.(apiError) : null;
          if (fallback) {
            try {
              await fallback();
              writeDoneRef.current = true;
              return await advance();
            } catch (fallbackErr) {
              if (fallbackErr === STEP_NOT_ADVANCED) writeDoneRef.current = false;
              failure = fallbackErr;
            }
          }
        }
        const failureError = normalizeApiError(failure);
        options?.onFailure?.(failureError);
        if (!options?.onFieldErrors?.(failure)) setError(failureError);
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
