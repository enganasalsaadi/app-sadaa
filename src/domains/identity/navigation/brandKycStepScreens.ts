import type { BrandKycStepScreens } from '@/domains/auth';
import { BrandVerificationStepScreen } from '../screens/BrandVerificationStepScreen';
import { BrandKycDocumentScreen } from '../screens/KycScreen';
import { BrandSocialProofScreen } from '../screens/SocialProofScreen';
import { BrandDomainEmailScreen } from '../screens/DomainEmailScreen';

/** Registration step 4 screens, handed to the auth brand wizard by the app (rule 01: auth can't import identity). */
export const BRAND_KYC_STEP_SCREENS = {
  BrandKyc: BrandVerificationStepScreen,
  BrandKycDocument: BrandKycDocumentScreen,
  BrandSocialProof: BrandSocialProofScreen,
  BrandDomainEmail: BrandDomainEmailScreen,
} as const satisfies BrandKycStepScreens;
