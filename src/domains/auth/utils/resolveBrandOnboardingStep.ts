import type { BrandOnboardingProgress } from '../store';

/** Remaining wizard steps after the account exists; `complete` → welcome screen. */
export type BrandOnboardingStep = 'phone' | 'profile' | 'kyc' | 'complete';

/**
 * Next step purely from server progress. Reads the facts (verified phone,
 * saved profile) rather than `current_step`, whose numbering doesn't match
 * the wizard (phone has no server step).
 */
export const resolveBrandOnboardingStep = (
  progress: BrandOnboardingProgress,
): BrandOnboardingStep => {
  if (progress.is_onboarding_complete) return 'complete';
  if (!progress.is_phone_verified) return 'phone';
  if (!progress.profile.business_type || !progress.profile.governorate) {
    return 'profile';
  }
  return 'kyc';
};
