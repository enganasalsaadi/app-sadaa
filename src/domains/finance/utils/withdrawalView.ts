import type { TFunction } from 'i18next';
import type { ThemeColors } from '@/core/theme';
import { PAYMENT_CHANNEL_DEF } from '../constants/paymentChannels';
import { WITHDRAWAL_REASON_LABEL, WITHDRAWAL_STATUS_LOOK } from '../constants/withdraw';
import type { Withdrawal, WithdrawalReason } from '../types';

/** Server label first (it may carry the limit), else the app's words for the code. */
export const formatReasonLabel = (reason: WithdrawalReason, t: TFunction): string =>
  reason.label ?? (reason.code ? t(WITHDRAWAL_REASON_LABEL[reason.code]) : '');

/** Where it went: the server's copy of the destination, else the channel's name, else nothing. */
export const withdrawalDestination = (withdrawal: Withdrawal, t: TFunction): string | null =>
  withdrawal.destination_label ??
  (withdrawal.channel ? t(PAYMENT_CHANNEL_DEF[withdrawal.channel].labelKey) : null);

/** Status pill label: the server's, else the app's for a known status. */
export const withdrawalStatusLabel = (withdrawal: Withdrawal, t: TFunction): string =>
  withdrawal.status_label ||
  (withdrawal.status ? t(WITHDRAWAL_STATUS_LOOK[withdrawal.status].labelKey) : '');

/** The money never left the wallet (or came back): shown struck through. */
export const isWithdrawalLost = (withdrawal: Withdrawal): boolean =>
  withdrawal.status ? WITHDRAWAL_STATUS_LOOK[withdrawal.status].lost : false;

/**
 * Row / head badge (rule 09 §2.1): money out stays neutral once paid, warning while on
 * its way, info when it came back, neutral when it never left.
 */
export const withdrawalBadgeColors = (
  withdrawal: Withdrawal,
  colors: ThemeColors,
): { bg: string; icon: string } => {
  switch (withdrawal.status) {
    case 'pending':
      return { bg: colors.status.warning.soft, icon: colors.status.warning.main };
    case 'returned':
      return { bg: colors.status.info.soft, icon: colors.status.info.main };
    case 'completed':
    case 'rejected':
    case 'cancelled':
    case null:
      return { bg: colors.surface.elevated, icon: colors.icon.secondary };
    default: {
      const _exhaustive: never = withdrawal.status;
      return _exhaustive;
    }
  }
};
