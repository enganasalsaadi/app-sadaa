import type { BrandOnboardingProgress } from '../store';

/** Remaining wizard steps after the account exists; `complete` → welcome screen. */
export type BrandOnboardingStep = 'phone' | 'profile' | 'kyc' | 'complete';

/**
 * Contract §15.11 resume resolver. Routes by `current_step` (it never
 * decreases), not by which profile fields exist. The phone OTP has no server
 * step: verifying it leaves `current_step` at 1.
 */
export const resolveBrandOnboardingStep = (
  progress: Pick<
    BrandOnboardingProgress,
    'is_onboarding_complete' | 'is_phone_verified' | 'current_step'
  >,
): BrandOnboardingStep => {
  if (progress.is_onboarding_complete) return 'complete';
  if (!progress.is_phone_verified) return 'phone';
  return progress.current_step <= 1 ? 'profile' : 'kyc';
};
