import type { Money } from '@/core/money';
import type { DealCancellation, DealStrike } from '../../types';
import { dealSettlement, strikeLife, strikesAlert, toCancelBody, toReasonBody } from '../dealCancel';

const usd = (amount: number): Money => ({ amount, currency: 'USD' });
const TOTAL = usd(15000);

type Terms = NonNullable<DealCancellation['brand']>;

const terms = (overrides: Partial<Terms> = {}): Terms => ({
  outcome: { key: 'kill_fee', label: 'Kill fee 40%' },
  freeUntil: null,
  refund: usd(9000),
  killFee: usd(6000),
  platformFee: usd(600),
  creatorNet: usd(5400),
  ...overrides,
});

describe('dealSettlement', () => {
  it('splits a kill fee into refund, creator and platform shares', () => {
    expect(dealSettlement(terms(), TOTAL)).toEqual([
      { key: 'refund', amount: usd(9000) },
      { key: 'creator', amount: usd(5400) },
      { key: 'fee', amount: usd(600) },
    ]);
  });

  it('returns the whole deal on a free cancel without a stated refund', () => {
    const free = terms({ outcome: { key: 'free', label: 'Free' }, refund: null, killFee: null, platformFee: null, creatorNet: null });
    expect(dealSettlement(free, TOTAL)).toEqual([{ key: 'refund', amount: TOTAL }]);
  });

  it('shows the kill fee as one share when the server gives no breakdown', () => {
    expect(dealSettlement(terms({ creatorNet: null, platformFee: null }), TOTAL)).toEqual([
      { key: 'refund', amount: usd(9000) },
      { key: 'creator', amount: usd(6000) },
    ]);
  });

  it('never invents a refund outside a free cancel and drops empty shares', () => {
    const disputed = terms({ outcome: { key: 'dispute_only', label: 'Dispute' }, refund: null, platformFee: usd(0) });
    expect(dealSettlement(disputed, TOTAL)).toEqual([{ key: 'creator', amount: usd(5400) }]);
  });
});

describe('reason bodies', () => {
  it('sends the note only when written', () => {
    expect(toReasonBody({ reason: 'personal', note: '  ' })).toEqual({ reason: 'personal' });
    expect(toReasonBody({ reason: 'other', note: ' Travel ' })).toEqual({ reason: 'other', note: 'Travel' });
  });

  it('echoes the outcome the brand saw', () => {
    expect(toCancelBody({ reason: 'budget_changed', note: '' }, 'kill_fee')).toEqual({
      reason: 'budget_changed',
      expected_outcome: 'kill_fee',
    });
  });
});

describe('strikeLife', () => {
  const DAY = 86_400_000;
  const strike = { occurredAt: 0, expiresAt: 90 * DAY };

  it('counts whole days left, rounding up', () => {
    expect(strikeLife(strike, 52 * DAY + 1)).toEqual({ daysLeft: 38, share: (38 * DAY - 1) / (90 * DAY) });
  });

  it('bottoms out at zero once expired', () => {
    expect(strikeLife(strike, 91 * DAY)).toEqual({ daysLeft: 0, share: 0 });
  });

  it('caps the share at a full fuse', () => {
    expect(strikeLife(strike, -DAY).share).toBe(1);
  });
});

describe('strikesAlert', () => {
  const DAY = 86_400_000;
  const strike = (id: string, expiresAt: number): DealStrike => ({
    id,
    dealId: 'd1',
    reason: { key: 'withdrew', label: 'Withdrew' },
    occurredAt: 0,
    expiresAt,
  });

  it('counts the active strikes and the days until the soonest clears', () => {
    const strikes = { activeCount: 2, items: [strike('a', 40 * DAY), strike('b', 12 * DAY)] };
    expect(strikesAlert(strikes, DAY / 2)).toEqual({ count: 2, daysLeft: 12 });
  });

  it('skips strikes already past their date', () => {
    const strikes = { activeCount: 1, items: [strike('a', DAY), strike('b', 30 * DAY)] };
    expect(strikesAlert(strikes, 2 * DAY)).toEqual({ count: 1, daysLeft: 28 });
  });

  it('is null with a clean record', () => {
    expect(strikesAlert({ activeCount: 0, items: [] }, 0)).toBeNull();
    expect(strikesAlert({ activeCount: 1, items: [strike('a', DAY)] }, 2 * DAY)).toBeNull();
  });
});
