import { Ban, CircleCheck, CircleX, Clock, Undo2, type LucideIcon } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import type { WithdrawStackParamList } from '@/core/navigation';
import type { HueTone } from '@/core/theme';
import type { WithdrawalReasonCode, WithdrawalStatus } from '../types';

/**
 * Default rules in USD cents and days (handoff §8), shown up front as guidance until the
 * server sends them; the quote is what really decides.
 */
export const WITHDRAW_LIMITS = { min: 2_500, dailyMax: 50_000, cooldownDays: 7 } as const;

/** Quiet time after the last keystroke before asking for a quote. */
export const WITHDRAW_QUOTE_DEBOUNCE_MS = 400;

/** History page size (same as the statement). */
export const WITHDRAWALS_PER_PAGE = 20;

export type WithdrawStepKey = 'amount' | 'review';

interface WithdrawStepDef {
  route: keyof WithdrawStackParamList;
  index: number;
  titleKey: ParseKeys;
}

/** Wizard order and titles (rule 09 §6). */
export const WITHDRAW_STEPS = {
  amount: { route: 'WithdrawAmount', index: 1, titleKey: 'finance.withdraw.steps.amount' },
  review: { route: 'WithdrawReview', index: 2, titleKey: 'finance.withdraw.steps.review' },
} as const satisfies Record<WithdrawStepKey, WithdrawStepDef>;

export const WITHDRAW_STEP_COUNT = 2;

/** The app's own words for a reason the server sent without a label (a `422` lists codes only). */
export const WITHDRAWAL_REASON_LABEL = {
  account_inactive: 'finance.withdraw.reasons.accountInactive',
  kyc_required: 'finance.withdraw.reasons.kycRequired',
  wallet_frozen: 'finance.withdraw.reasons.walletFrozen',
  withdrawals_paused: 'finance.withdraw.reasons.withdrawalsPaused',
  below_minimum: 'finance.withdraw.reasons.belowMinimum',
  daily_limit_exceeded: 'finance.withdraw.reasons.dailyLimitExceeded',
  open_request_exists: 'finance.withdraw.reasons.openRequestExists',
  cooldown_active: 'finance.withdraw.reasons.cooldownActive',
  insufficient_funds: 'finance.withdraw.reasons.insufficientFunds',
  fx_rate_stale: 'finance.withdraw.reasons.fxRateStale',
  currency_not_supported: 'finance.withdraw.reasons.currencyNotSupported',
  amount_below_fee: 'finance.withdraw.reasons.amountBelowFee',
} as const satisfies Record<WithdrawalReasonCode, ParseKeys>;

interface WithdrawalStatusLook {
  tone: HueTone;
  icon: LucideIcon;
  /** Filter chip / fallback label. */
  labelKey: ParseKeys;
  /** The money never left: the amount shows struck through. */
  lost: boolean;
}

/** Pill and badge per status (rule 08 status colors; status never by color alone). */
export const WITHDRAWAL_STATUS_LOOK = {
  pending: { tone: 'warning', icon: Clock, labelKey: 'finance.withdraw.status.pending', lost: false },
  completed: { tone: 'success', icon: CircleCheck, labelKey: 'finance.withdraw.status.completed', lost: false },
  // Sent back to the balance in full by the payout partner.
  returned: { tone: 'info', icon: Undo2, labelKey: 'finance.withdraw.status.returned', lost: true },
  rejected: { tone: 'danger', icon: CircleX, labelKey: 'finance.withdraw.status.rejected', lost: true },
  cancelled: { tone: 'neutral', icon: Ban, labelKey: 'finance.withdraw.status.cancelled', lost: true },
} as const satisfies Record<WithdrawalStatus, WithdrawalStatusLook>;

/** History filter chips, in the board's order (newest-relevant first). */
export const WITHDRAWAL_FILTERS: readonly WithdrawalStatus[] = [
  'pending',
  'completed',
  'returned',
  'rejected',
  'cancelled',
];
