import { resolveInfluencerOnboardingStep } from '../resolveInfluencerOnboardingStep';

const base = { is_onboarding_complete: false, is_phone_verified: false, current_step: 1 };

describe('resolveInfluencerOnboardingStep', () => {
  it('starts with phone verification', () => {
    expect(resolveInfluencerOnboardingStep(base)).toBe('phone');
  });

  it('keeps phone first even past step 1', () => {
    expect(resolveInfluencerOnboardingStep({ ...base, current_step: 2 })).toBe('phone');
  });

  it('asks for socials once the phone is verified (step stays 1)', () => {
    expect(resolveInfluencerOnboardingStep({ ...base, is_phone_verified: true })).toBe(
      'socials',
    );
  });

  it('asks for rates after socials are saved', () => {
    expect(
      resolveInfluencerOnboardingStep({ ...base, is_phone_verified: true, current_step: 2 }),
    ).toBe('rates');
  });

  it('asks for KYC once rates are saved or skipped', () => {
    expect(
      resolveInfluencerOnboardingStep({ ...base, is_phone_verified: true, current_step: 3 }),
    ).toBe('kyc');
  });

  it('is complete when the server says so', () => {
    expect(
      resolveInfluencerOnboardingStep({
        is_onboarding_complete: true,
        is_phone_verified: true,
        current_step: 4,
      }),
    ).toBe('complete');
  });
});
