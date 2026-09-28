import { resolveInfluencerOnboardingStep } from '../resolveInfluencerOnboardingStep';
import type { InfluencerOnboardingProgress } from '../../store';

const base: InfluencerOnboardingProgress = {
  is_onboarding_complete: false,
  is_phone_verified: false,
  current_step: 1,
  has_rate_card: false,
  profile: { full_name: 'Ahmad', governorate: 'damascus', niches: [], platforms: [] },
};

const instagram = { platform: 'instagram', username: 'ahmad', follower_tier: 'MICRO' as const };

describe('resolveInfluencerOnboardingStep', () => {
  it('starts with phone verification', () => {
    expect(resolveInfluencerOnboardingStep(base)).toBe('phone');
  });

  it('keeps phone first even when socials exist', () => {
    expect(
      resolveInfluencerOnboardingStep({
        ...base,
        profile: { niches: ['beauty'], platforms: [instagram] },
      }),
    ).toBe('phone');
  });

  it('asks for socials once the phone is verified', () => {
    expect(resolveInfluencerOnboardingStep({ ...base, is_phone_verified: true })).toBe('socials');
  });

  it('asks for socials when niches exist but no platform', () => {
    expect(
      resolveInfluencerOnboardingStep({
        ...base,
        is_phone_verified: true,
        profile: { niches: ['beauty'], platforms: [] },
      }),
    ).toBe('socials');
  });

  it('handles a missing profile', () => {
    expect(
      resolveInfluencerOnboardingStep({ ...base, is_phone_verified: true, profile: null }),
    ).toBe('socials');
  });

  it('moves to rates once niches and a platform are saved', () => {
    expect(
      resolveInfluencerOnboardingStep({
        ...base,
        is_phone_verified: true,
        current_step: 2,
        profile: { niches: ['beauty'], platforms: [instagram] },
      }),
    ).toBe('rates');
  });

  it('is complete when the server says so, rates or not', () => {
    expect(
      resolveInfluencerOnboardingStep({ ...base, is_onboarding_complete: true }),
    ).toBe('complete');
  });
});
