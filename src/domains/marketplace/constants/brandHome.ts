import type { SettingsStackParamList } from '@/core/navigation';
import type { LiveIslandTone } from '@/shared/ui';
import type { BrandHomeIslandType } from '../types/explore';

/**
 * Home island (handoff §5): the server writes the copy, the app picks the tone and where
 * the CTA goes. Every verification state opens the picker, which shows the active attempt.
 */
export const BRAND_HOME_ISLAND = {
  kyc_rejected: { tone: 'danger', screen: 'CompanyVerification' },
  verify_account: { tone: 'warning', screen: 'CompanyVerification' },
  verification_pending: { tone: 'live', screen: 'CompanyVerification' },
  complete_profile: { tone: 'warning', screen: 'CompanyInfoScreen' },
} as const satisfies Record<
  BrandHomeIslandType,
  { tone: LiveIslandTone; screen: keyof SettingsStackParamList }
>;
