import type { InfluencerOnboardingProgress } from '../store';

/** Remaining creator wizard steps after the account exists; `complete` → welcome. */
export type InfluencerOnboardingStep = 'phone' | 'socials' | 'rates' | 'kyc' | 'complete';

/**
 * Contract §15.11 resume resolver. Routes by `current_step` (it never
 * decreases), not by which profile fields exist. The phone OTP has no server
 * step: verifying it leaves `current_step` at 1.
 */
export const resolveInfluencerOnboardingStep = (
  progress: Pick<
    InfluencerOnboardingProgress,
    'is_onboarding_complete' | 'is_phone_verified' | 'current_step'
  >,
): InfluencerOnboardingStep => {
  if (progress.is_onboarding_complete) return 'complete';
  if (!progress.is_phone_verified) return 'phone';
  if (progress.current_step <= 1) return 'socials';
  return progress.current_step === 2 ? 'rates' : 'kyc';
};
