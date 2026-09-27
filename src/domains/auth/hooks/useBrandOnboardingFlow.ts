import { useCallback, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '@/core/store';
import { normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import type {
  BrandOnboardingStackParamList,
  BrandWizardStackParamList,
} from '@/core/navigation';
import { brandOnboardingApi } from '../api';
import { BRAND_STEP_ROUTE } from '../constants/brandOnboarding';
import { resolveBrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';
import type { BrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';

type CurrentStep = Exclude<BrandOnboardingStep, 'complete'>;

interface RunStepOptions {
  /** Return true when the error was shown on form fields (422) — skips the banner. */
  onFieldErrors?: (error: unknown) => boolean;
}

// Server-side step that didn't move after a successful write.
const STEP_NOT_ADVANCED = { data: { message: null }, status: 409 };

/**
 * Drives one wizard screen: run its write, re-read GET /onboarding/progress
 * (the only source of truth, rule 06), then go wherever the server says.
 *
 * If the write succeeded but the progress read failed, a retry re-runs only
 * the read, never the write (an OTP can't be verified twice).
 */
export const useBrandOnboardingFlow = (current: CurrentStep) => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList>>();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);
  const inFlightRef = useRef(false);
  const writeDoneRef = useRef(false);

  const goTo = useCallback(
    (next: BrandOnboardingStep) => {
      if (next === 'complete') {
        navigation
          .getParent<NativeStackNavigationProp<BrandOnboardingStackParamList>>()
          ?.replace('BrandWelcome');
        return;
      }
      const route = BRAND_STEP_ROUTE[next];
      // Forward into KYC keeps the profile underneath for back-editing; the
      // phone step is never returned to.
      if (next === 'kyc') navigation.navigate(route);
      else navigation.replace(route);
    },
    [navigation],
  );

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
        const progress = await dispatch(
          brandOnboardingApi.endpoints.getOnboardingProgress.initiate(undefined, {
            forceRefetch: true,
            subscribe: false,
          }),
        ).unwrap();
        const next = resolveBrandOnboardingStep(progress);
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
    [current, dispatch, goTo],
  );

  const clearError = useCallback(() => setError(null), []);

  return { runStep, isBusy, error, clearError };
};
