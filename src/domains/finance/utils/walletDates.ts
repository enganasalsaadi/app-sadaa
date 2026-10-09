import type { TFunction } from 'i18next';
import { formatDate } from '@/core/i18n';
import type { WalletTransaction } from '../types';

export type LedgerDayKind = 'today' | 'yesterday' | 'date';

/** One local day of a newest-first list (ledger lines, top-ups). */
export interface LedgerDay<T = WalletTransaction> {
  /** Local `YYYY-MM-DD`. */
  key: string;
  kind: LedgerDayKind;
  /** Local midnight of that day, for the date label. */
  date: Date;
  /** `false` = an older year: the label adds it ("14 Dec 2025"). */
  thisYear: boolean;
  items: T[];
}

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Items (newest first) grouped by the device's local day, in order. An item without a valid date is dropped. */
export const groupByDay = <T>(items: readonly T[], dateOf: (item: T) => string, now: Date): LedgerDay<T>[] => {
  const today = dayKey(now);
  const yesterdayDate = startOfDay(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);

  const days: LedgerDay<T>[] = [];
  for (const item of items) {
    const created = new Date(dateOf(item));
    if (Number.isNaN(created.getTime())) continue;
    const key = dayKey(created);
    const last = days[days.length - 1];
    if (last?.key === key) {
      last.items.push(item);
      continue;
    }
    days.push({
      key,
      kind: key === today ? 'today' : key === yesterday ? 'yesterday' : 'date',
      date: startOfDay(created),
      thisYear: created.getFullYear() === now.getFullYear(),
      items: [item],
    });
  }
  return days;
};

export const groupLinesByDay = (lines: readonly WalletTransaction[], now: Date): LedgerDay[] =>
  groupByDay(lines, line => line.created_at, now);

const DAY_LABEL: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
const DAY_LABEL_WITH_YEAR: Intl.DateTimeFormatOptions = { ...DAY_LABEL, year: 'numeric' };

/** "Today" / "Yesterday" / "14 October" (+ the year when it isn't this one). */
export const formatDayLabel = (day: LedgerDay<unknown>, t: TFunction, lang: string): string => {
  switch (day.kind) {
    case 'today':
      return t('finance.wallet.activity.today');
    case 'yesterday':
      return t('finance.wallet.activity.yesterday');
    case 'date':
      return formatDate(day.date, day.thisYear ? DAY_LABEL : DAY_LABEL_WITH_YEAR, lang);
    default: {
      const _exhaustive: never = day.kind;
      return _exhaustive;
    }
  }
};

/** `YYYY-MM` (earnings bucket) → the 1st of that month, local time; `null` when malformed. */
export const parseBucketMonth = (month: string): Date | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return new Date(Number(match[1]), monthIndex, 1);
};
