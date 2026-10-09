import type { TFunction } from 'i18next';
import type { ThemeColors } from '@/core/theme';
import { PAYMENT_CHANNEL_DEF } from '../constants/paymentChannels';
import { TOP_UP_STATUS_LOOK } from '../constants/topUp';
import type { TopUp } from '../types';

/** Server label first, the app's own words for a known channel, else nothing. */
export const topUpChannelLabel = (topUp: TopUp, t: TFunction): string | null =>
  topUp.channel_label ?? (topUp.channel ? t(PAYMENT_CHANNEL_DEF[topUp.channel].labelKey) : null);

/** Status pill label: the server's, else the app's for a known status. */
export const topUpStatusLabel = (topUp: TopUp, t: TFunction): string =>
  topUp.status_label || (topUp.status ? t(TOP_UP_STATUS_LOOK[topUp.status].labelKey) : '');

/**
 * Row / head badge (rule 09 §2.1): mint once the money is in, warning while in review,
 * neutral when it never arrived or was taken back.
 */
export const topUpBadgeColors = (topUp: TopUp, colors: ThemeColors): { bg: string; icon: string } => {
  switch (topUp.status) {
    case 'completed':
      return { bg: colors.money.soft, icon: colors.money.main };
    case 'pending_review':
      return { bg: colors.status.warning.soft, icon: colors.status.warning.main };
    case 'rejected':
    case 'reversed':
    case null:
      return { bg: colors.surface.elevated, icon: colors.icon.secondary };
    default: {
      const _exhaustive: never = topUp.status;
      return _exhaustive;
    }
  }
};
