import { resolveBrandOnboardingStep } from '../resolveBrandOnboardingStep';

const base = { is_onboarding_complete: false, is_phone_verified: false, current_step: 1 };

describe('resolveBrandOnboardingStep', () => {
  it('routes to phone verification when the phone is not verified', () => {
    expect(resolveBrandOnboardingStep(base)).toBe('phone');
  });

  it('keeps phone first even past step 1', () => {
    expect(resolveBrandOnboardingStep({ ...base, current_step: 2 })).toBe('phone');
  });

  it('routes to profile once the phone is verified (step stays 1)', () => {
    expect(resolveBrandOnboardingStep({ ...base, is_phone_verified: true })).toBe('profile');
  });

  it.each([2, 3])('routes to kyc from current_step %p', current_step => {
    expect(
      resolveBrandOnboardingStep({ ...base, is_phone_verified: true, current_step }),
    ).toBe('kyc');
  });

  it('is complete when the server says so, KYC skipped or not', () => {
    expect(
      resolveBrandOnboardingStep({
        is_onboarding_complete: true,
        is_phone_verified: true,
        current_step: 3,
      }),
    ).toBe('complete');
  });

  it('trusts completion over an unverified phone', () => {
    expect(resolveBrandOnboardingStep({ ...base, is_onboarding_complete: true })).toBe(
      'complete',
    );
  });
});
