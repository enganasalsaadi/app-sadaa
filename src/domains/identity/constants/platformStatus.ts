import type { ParseKeys } from 'i18next';
import { AlertCircle, Clock, type LucideIcon } from 'lucide-react-native';
import type { HueTone } from '@/core/theme';
import type { PlatformResource } from '@/domains/auth';

export type PlatformVerificationStatus = PlatformResource['verification_status'];

export interface PlatformStatusPill {
  labelKey: ParseKeys;
  tone: HueTone;
  icon: LucideIcon;
}

/** Review pill per verification status (contract §5.1); `null` = verified, nothing to flag. */
export const PLATFORM_STATUS_PILL = {
  auto_verified: null,
  approved: null,
  pending_review: { labelKey: 'account.platforms.status.pendingReview', tone: 'info', icon: Clock },
  rejected: { labelKey: 'account.platforms.status.rejected', tone: 'danger', icon: AlertCircle },
} as const satisfies Record<PlatformVerificationStatus, PlatformStatusPill | null>;
