import type { ParseKeys } from 'i18next';
import { PauseCircle, type LucideIcon } from 'lucide-react-native';
import type { HueTone } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import type { PlatformResource } from '@/domains/auth';
import { PLATFORM_STATUS_PILL } from '@/domains/identity';

/** The primary account first, the rest in server order. */
export const orderPlatforms = (
  items: readonly PlatformResource[],
): PlatformResource[] => {
  const primary = items.find(p => p.is_primary);
  return primary ? [primary, ...items.filter(p => p !== primary)] : [...items];
};

export interface PlatformIssue {
  labelKey: ParseKeys;
  tone: HueTone;
  icon: LucideIcon;
}

const UNAVAILABLE: PlatformIssue = {
  labelKey: 'account.platforms.unavailable',
  tone: 'neutral',
  icon: PauseCircle,
};

/** At most one label per platform: a review problem outranks a paused account. */
export const resolvePlatformIssue = (
  platform: PlatformResource,
): PlatformIssue | null =>
  PLATFORM_STATUS_PILL[platform.verification_status] ??
  (platform.is_available ? null : UNAVAILABLE);

const COMPACT: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

/** `125K`; a dash for manual platforms, which report no count. */
export const formatFollowers = (count: number | null): string =>
  count == null ? '—' : formatNumber(count, COMPACT);
