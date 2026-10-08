import type { ParseKeys } from 'i18next';
import {
  AtSign,
  BadgeCheck,
  Building2,
  Camera,
  CircleDollarSign,
  Link2,
  Mail,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import type { ProfileStepKey } from '@/domains/auth';

/** Where a missing-step card leads. `editInfo` = the role's own edit screen (personal or company). */
export type ProfileStepTarget = 'editInfo' | 'avatar' | 'platforms' | 'rates' | 'kyc';

export interface ProfileStepMeta {
  icon: LucideIcon;
  titleKey: ParseKeys;
  /** Brand wording when it differs (the brand's avatar is its logo). */
  brandTitleKey?: ParseKeys;
  target: ProfileStepTarget | null;
}

/**
 * Missing-step cards (contract §3.1, app owns texts/icons/CTA). `null` = never a card:
 * `account_created` is always done. `kyc` stays in the rail (its points are part of the
 * total) even though it also has its own card; the screen adapts it to the KYC status.
 */
export const PROFILE_STEP_META = {
  account_created: null,
  basic_info: { icon: UserRound, titleKey: 'account.profile.steps.basicInfo', target: 'editInfo' },
  avatar: {
    icon: Camera,
    titleKey: 'account.profile.steps.avatar',
    brandTitleKey: 'account.profile.steps.logo',
    target: 'avatar',
  },
  email: { icon: Mail, titleKey: 'account.profile.steps.email', target: 'editInfo' },
  platforms: { icon: AtSign, titleKey: 'account.profile.steps.platforms', target: 'platforms' },
  platforms_verified: {
    icon: BadgeCheck,
    titleKey: 'account.profile.steps.platformsVerified',
    target: 'platforms',
  },
  rate_cards: { icon: CircleDollarSign, titleKey: 'account.profile.steps.rateCards', target: 'rates' },
  kyc: {
    icon: ShieldCheck,
    titleKey: 'account.profile.steps.kyc',
    brandTitleKey: 'account.profile.steps.kycBrand',
    target: 'kyc',
  },
  company_info: { icon: Building2, titleKey: 'account.profile.steps.companyInfo', target: 'editInfo' },
  social_links: { icon: Link2, titleKey: 'account.profile.steps.socialLinks', target: 'editInfo' },
} as const satisfies Record<ProfileStepKey, ProfileStepMeta | null>;
