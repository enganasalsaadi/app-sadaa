import { resolveBrandOnboardingStep } from '../resolveBrandOnboardingStep';
import type { BrandOnboardingProgress } from '../../store';

const baseProgress: BrandOnboardingProgress = {
  is_onboarding_complete: false,
  is_phone_verified: false,
  current_step: 1,
  has_kyc_document: false,
  profile: {},
};

const fullProfile = { business_type: 'retail_ecommerce', governorate: 'damascus' };

describe('resolveBrandOnboardingStep', () => {
  it('routes to phone verification when the phone is not verified', () => {
    expect(resolveBrandOnboardingStep(baseProgress)).toBe('phone');
  });

  it('keeps phone first even if a profile already exists', () => {
    expect(
      resolveBrandOnboardingStep({ ...baseProgress, profile: fullProfile }),
    ).toBe('phone');
  });

  it('routes to profile once the phone is verified but the profile is missing', () => {
    expect(
      resolveBrandOnboardingStep({
        ...baseProgress,
        is_phone_verified: true,
        current_step: 2,
      }),
    ).toBe('profile');
  });

  it.each([
    [{ business_type: 'retail_ecommerce' }],
    [{ governorate: 'damascus' }],
    [{ business_type: null, governorate: 'damascus' }],
  ])('routes to profile while it is partial: %p', profile => {
    expect(
      resolveBrandOnboardingStep({
        ...baseProgress,
        is_phone_verified: true,
        current_step: 3,
        profile,
      }),
    ).toBe('profile');
  });

  it('routes to kyc once the profile is saved', () => {
    expect(
      resolveBrandOnboardingStep({
        ...baseProgress,
        is_phone_verified: true,
        current_step: 3,
        profile: fullProfile,
      }),
    ).toBe('kyc');
  });

  it('is complete when the server says so, KYC skipped or not', () => {
    expect(
      resolveBrandOnboardingStep({
        ...baseProgress,
        is_onboarding_complete: true,
        is_phone_verified: true,
        current_step: 3,
        profile: fullProfile,
      }),
    ).toBe('complete');
  });
});
