import {
  Briefcase,
  Shirt,
  Smartphone,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';
import type { SettingsStackParamList } from '@/core/navigation';
import type { LiveIslandTone } from '@/shared/ui';
import type { BrandHomeIslandType } from '../types/explore';

/** Where an island's CTA goes: an account screen (Settings tab) or the top-up wizard. */
export type BrandHomeIslandTarget =
  | { tab: 'settings'; screen: keyof SettingsStackParamList }
  | { tab: 'topUp' };

/**
 * Home island (handoff §5, B13 §5.2): the server writes the copy, the app picks the tone and
 * where the CTA goes. Every verification state opens the picker, which shows the active attempt;
 * offers waiting for money open the top-up (they are funded by themselves once it lands).
 */
export const BRAND_HOME_ISLAND = {
  kyc_rejected: { tone: 'danger', target: { tab: 'settings', screen: 'CompanyVerification' } },
  verify_account: { tone: 'warning', target: { tab: 'settings', screen: 'CompanyVerification' } },
  verification_pending: { tone: 'live', target: { tab: 'settings', screen: 'CompanyVerification' } },
  fund_deals: { tone: 'warning', target: { tab: 'topUp' } },
  complete_profile: { tone: 'warning', target: { tab: 'settings', screen: 'CompanyInfoScreen' } },
} as const satisfies Record<BrandHomeIslandType, { tone: LiveIslandTone; target: BrandHomeIslandTarget }>;

/**
 * Category tile icons by `/explore/filters` category value. The server owns the list, so an
 * unknown or new category gets the fallback rather than breaking the row.
 */
const CATEGORY_ICON: Readonly<Record<string, LucideIcon>> = {
  restaurants: Utensils,
  fashion: Shirt,
  electronics: Smartphone,
  beauty: Sparkles,
  services: Briefcase,
};

export const resolveCategoryIcon = (value: string): LucideIcon => CATEGORY_ICON[value] ?? Sparkles;
