import type { CurrencyCode } from '@/core/money';
import type { InfluencerWizardStackParamList } from '@/core/navigation';
import type { InfluencerOnboardingStep } from '../utils/resolveInfluencerOnboardingStep';
import type { WizardStepDef } from './wizard';

export type InfluencerWizardStepKey = 'account' | Exclude<InfluencerOnboardingStep, 'complete'>;

export const INFLUENCER_WIZARD_STEPS = {
  account: {
    index: 1,
    titleKey: 'auth.influencerOnboarding.account.title',
    subtitleKey: 'auth.influencerOnboarding.account.subtitle',
  },
  phone: {
    index: 2,
    titleKey: 'auth.phoneVerify.title',
    subtitleKey: 'auth.phoneVerify.subtitle',
  },
  socials: {
    index: 3,
    titleKey: 'auth.influencerOnboarding.socials.title',
    subtitleKey: 'auth.influencerOnboarding.socials.subtitle',
  },
  rates: {
    index: 4,
    titleKey: 'auth.influencerOnboarding.rates.title',
    subtitleKey: 'auth.influencerOnboarding.rates.subtitle',
  },
  kyc: {
    index: 5,
    titleKey: 'auth.influencerOnboarding.kyc.title',
    subtitleKey: 'auth.influencerOnboarding.kyc.subtitle',
  },
} as const satisfies Record<InfluencerWizardStepKey, WizardStepDef>;

export const INFLUENCER_WIZARD_TOTAL_STEPS = Object.keys(INFLUENCER_WIZARD_STEPS).length;

export const INFLUENCER_STEP_ROUTE = {
  phone: 'InfluencerVerifyPhone',
  socials: 'InfluencerSocials',
  rates: 'InfluencerRates',
  kyc: 'InfluencerKyc',
} as const satisfies Record<
  Exclude<InfluencerWizardStepKey, 'account'>,
  keyof InfluencerWizardStackParamList
>;

/** Server caps niches at 3 (InfluencerStep2Request rules). */
export const INFLUENCER_MAX_NICHES = 3;
/** Rate cards are priced in dollars server-side (`price_usd`). */
export const RATE_CURRENCY = 'USD' satisfies CurrencyCode;
/** Sanity ceiling per service, catches a slipped zero (5000 for 50). */
export const RATE_MAX_USD_MINOR = 50_000 * 100;

/** Step-4 ID scans, mirrors the server rules (unlike brand KYC, webp is accepted). */
export const INFLUENCER_KYC_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const INFLUENCER_KYC_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export { FOLLOWER_TIER_STYLE, FOLLOWER_TIER_LEVELS } from '@/core/config';
