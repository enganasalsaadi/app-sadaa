import type { InfluencerOnboardingProgress } from '../store';

/** Remaining creator wizard steps after the account exists; `complete` → welcome. */
export type InfluencerOnboardingStep = 'phone' | 'socials' | 'rates' | 'complete';

/** Next step from server facts (verified phone, saved niches + platforms), not `current_step`. */
export const resolveInfluencerOnboardingStep = (
  progress: InfluencerOnboardingProgress,
): InfluencerOnboardingStep => {
  if (progress.is_onboarding_complete) return 'complete';
  if (!progress.is_phone_verified) return 'phone';
  const niches = progress.profile?.niches ?? [];
  const platforms = progress.profile?.platforms ?? [];
  if (niches.length === 0 || platforms.length === 0) return 'socials';
  return 'rates';
};
