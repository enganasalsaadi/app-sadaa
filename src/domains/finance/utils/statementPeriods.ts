import type { StatementPeriodPreset } from '../constants/statementFilters';
import type { WalletTransactionFilters, WalletTransactionType } from '../types';
import { dayKey } from './walletDates';

/** The statement's date filter: everything, a ready-made period, or days the user picked. */
export type StatementPeriod =
  | { kind: 'all' }
  | { kind: 'preset'; preset: StatementPeriodPreset }
  | { kind: 'custom'; from: Date; to: Date };

/** Local midnights, both ends inclusive. */
export interface DateSpan {
  from: Date;
  to: Date;
}

export const ALL_TIME: StatementPeriod = { kind: 'all' };

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * The days a period covers; `null` = all time. Calendar months, so "last 3 months" in
 * October is August–October, and a period that includes today ends today.
 */
export const resolvePeriodSpan = (period: StatementPeriod, now: Date): DateSpan | null => {
  switch (period.kind) {
    case 'all':
      return null;
    case 'custom':
      return { from: startOfDay(period.from), to: startOfDay(period.to) };
    case 'preset': {
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = startOfDay(now);
      switch (period.preset) {
        case 'thisMonth':
          return { from: new Date(year, month, 1), to: today };
        case 'lastMonth':
          // Day 0 of this month = the last day of the previous one.
          return { from: new Date(year, month - 1, 1), to: new Date(year, month, 0) };
        case 'last3Months':
          return { from: new Date(year, month - 2, 1), to: today };
        case 'thisYear':
          return { from: new Date(year, 0, 1), to: today };
        default: {
          const _exhaustive: never = period.preset;
          return _exhaustive;
        }
      }
    }
    default: {
      const _exhaustive: never = period;
      return _exhaustive;
    }
  }
};

/**
 * Query args, which are also the cache key: unset filters are left out, so the unfiltered
 * statement shares the wallet tab's cache (`{}`).
 */
export const toStatementFilters = (
  type: WalletTransactionType | null,
  period: StatementPeriod,
  now: Date,
): WalletTransactionFilters => {
  const span = resolvePeriodSpan(period, now);
  return {
    ...(type ? { type } : {}),
    ...(span ? { from: dayKey(span.from), to: dayKey(span.to) } : {}),
  };
};
