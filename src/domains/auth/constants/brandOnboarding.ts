import type { BrandWizardStackParamList } from '@/core/navigation';
import type { BrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';
import type { WizardStepDef } from './wizard';

/** Every wizard step, including the pre-auth account step. */
export type BrandWizardStepKey = 'account' | Exclude<BrandOnboardingStep, 'complete'>;

// Single source for order, titles and routes. Adding a step fails the build
// until every map below covers it.
export const BRAND_WIZARD_STEPS = {
  account: {
    index: 1,
    titleKey: 'auth.brandOnboarding.account.title',
    subtitleKey: 'auth.brandOnboarding.account.subtitle',
  },
  phone: {
    index: 2,
    titleKey: 'auth.brandOnboarding.phone.title',
    subtitleKey: 'auth.brandOnboarding.phone.subtitle',
  },
  profile: {
    index: 3,
    titleKey: 'auth.brandOnboarding.profile.title',
    subtitleKey: 'auth.brandOnboarding.profile.subtitle',
  },
  kyc: {
    index: 4,
    titleKey: 'auth.brandOnboarding.kyc.title',
    subtitleKey: 'auth.brandOnboarding.kyc.subtitle',
  },
} as const satisfies Record<BrandWizardStepKey, WizardStepDef>;

export const BRAND_WIZARD_TOTAL_STEPS = Object.keys(BRAND_WIZARD_STEPS).length;

export const BRAND_STEP_ROUTE = {
  phone: 'BrandVerifyPhone',
  profile: 'BrandProfile',
  kyc: 'BrandKyc',
} as const satisfies Record<
  Exclude<BrandWizardStepKey, 'account'>,
  keyof BrandWizardStackParamList
>;

export const KYC_DOCUMENT_TYPE = 'commercial_register';
export const KYC_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const KYC_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

/** Resend throttle, mirrors the server (60s). */
export const PHONE_OTP_RESEND_SECONDS = 60;
