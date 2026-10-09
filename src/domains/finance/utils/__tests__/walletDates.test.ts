import type { WalletTransaction } from '../../types';
import { groupLinesByDay, parseBucketMonth } from '../walletDates';

const line = (reference: string, created: Date): WalletTransaction => ({
  reference,
  type: 'escrow_release',
  type_label: 'تحرير دفعة',
  direction: 'credit',
  amount: { amount: 40000, currency: 'USD' },
  balance_after: { amount: 40000, currency: 'USD' },
  original: null,
  exchange_rate: null,
  source: null,
  details: {},
  created_at: created.toISOString(),
  description: null,
  counterparty: null,
  status: null,
  status_label: null,
  affects_balance: true,
});

describe('groupLinesByDay', () => {
  const now = new Date(2026, 9, 9, 15, 0);

  it('groups consecutive lines by local day and names today and yesterday', () => {
    const days = groupLinesByDay(
      [
        line('A', new Date(2026, 9, 9, 10, 42)),
        line('B', new Date(2026, 9, 9, 9, 15)),
        line('C', new Date(2026, 9, 8, 18, 30)),
        line('D', new Date(2026, 9, 2, 8, 0)),
      ],
      now,
    );
    expect(days.map(day => [day.kind, day.items.map(item => item.reference)])).toEqual([
      ['today', ['A', 'B']],
      ['yesterday', ['C']],
      ['date', ['D']],
    ]);
    expect(days[2]?.key).toBe('2026-10-02');
  });

  it('drops a line with an unreadable date', () => {
    const bad = { ...line('X', now), created_at: 'not a date' };
    expect(groupLinesByDay([bad], now)).toEqual([]);
  });
});

describe('parseBucketMonth', () => {
  it('reads YYYY-MM as the first of the month', () => {
    expect(parseBucketMonth('2026-10')).toEqual(new Date(2026, 9, 1));
  });

  it('rejects malformed months', () => {
    expect(parseBucketMonth('2026-13')).toBeNull();
    expect(parseBucketMonth('Oct 2026')).toBeNull();
  });
});
