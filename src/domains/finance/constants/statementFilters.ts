import type { ParseKeys } from 'i18next';
import type { WalletRole, WalletTransactionType } from '../types';

export interface StatementTypeFilter {
  type: WalletTransactionType;
  label: ParseKeys;
}

/**
 * Type chips per role, after "All". The API filters one type at a time, so each chip is
 * the line type the role looks for most; a role never sees a type it can't have (rule 06).
 */
export const STATEMENT_TYPE_FILTERS = {
  creator: [
    { type: 'escrow_release', label: 'finance.statement.types.dealEarnings' },
    { type: 'withdrawal_request', label: 'finance.statement.types.withdrawals' },
    { type: 'promo_credit', label: 'finance.statement.types.rewards' },
  ],
  brand: [
    { type: 'top_up', label: 'finance.statement.types.topUps' },
    { type: 'escrow_hold', label: 'finance.statement.types.escrowHolds' },
    { type: 'escrow_refund', label: 'finance.statement.types.refunds' },
  ],
} as const satisfies Record<WalletRole, readonly StatementTypeFilter[]>;

/** Ready-made periods in the date sheet, before "Custom range". */
export const STATEMENT_PERIOD_PRESETS = ['thisMonth', 'lastMonth', 'last3Months', 'thisYear'] as const;
export type StatementPeriodPreset = (typeof STATEMENT_PERIOD_PRESETS)[number];

export const STATEMENT_PERIOD_LABEL = {
  thisMonth: 'finance.statement.period.thisMonth',
  lastMonth: 'finance.statement.period.lastMonth',
  last3Months: 'finance.statement.period.last3Months',
  thisYear: 'finance.statement.period.thisYear',
} as const satisfies Record<StatementPeriodPreset, ParseKeys>;
