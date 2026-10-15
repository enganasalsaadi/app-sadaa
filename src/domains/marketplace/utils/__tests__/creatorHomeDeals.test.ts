import { CREATOR_DEAL_CLOCK_HORIZON_SECONDS } from '../../constants/creatorHomeDeals';
import type { CreatorActiveDeal } from '../../types';
import { creatorDealClock, splitCreatorDeals } from '../creatorHomeDeals';

const NOW = 1_800_000_000_000;
const HOUR = 3_600_000;

const deal = (overrides: Partial<CreatorActiveDeal> = {}): CreatorActiveDeal => ({
  id: 'd1',
  status: { key: 'in_progress', label: 'In progress' },
  stage: null,
  brand: { name: 'Nova', avatarUrl: null },
  title: 'Summer reel',
  total: { amount: 32000, currency: 'USD' },
  dueAt: null,
  needsAction: false,
  action: null,
  ...overrides,
});

describe('creatorDealClock', () => {
  it('is paused without a deadline', () => {
    expect(creatorDealClock(null, NOW)).toEqual({ kind: 'paused' });
  });

  it('counts the seconds left and turns late under 12 hours', () => {
    expect(creatorDealClock(NOW + 11 * HOUR, NOW)).toEqual({
      kind: 'left',
      seconds: 11 * 3600,
      share: (11 * 3600) / CREATOR_DEAL_CLOCK_HORIZON_SECONDS,
      late: true,
    });
    expect(creatorDealClock(NOW + 12 * HOUR, NOW)).toMatchObject({ late: false });
  });

  it('caps the gauge at full and never goes below empty', () => {
    expect(creatorDealClock(NOW + 200 * HOUR, NOW)).toMatchObject({ share: 1, late: false });
    expect(creatorDealClock(NOW - HOUR, NOW)).toMatchObject({ seconds: 0, share: 0, late: true });
  });
});

describe('splitCreatorDeals', () => {
  it('keeps the server order of the deals waiting on the creator', () => {
    const items = [
      deal({ id: 'a', needsAction: true }),
      deal({ id: 'b' }),
      deal({ id: 'c', needsAction: true }),
    ];
    expect(splitCreatorDeals(items).waiting.map(item => item.id)).toEqual(['a', 'c']);
  });

  it('picks the soonest deadline among the rest as next up', () => {
    const items = [
      deal({ id: 'late', dueAt: NOW + 9 * HOUR }),
      deal({ id: 'soon', dueAt: NOW + 2 * HOUR }),
      deal({ id: 'paused', dueAt: null }),
      deal({ id: 'mine', needsAction: true, dueAt: NOW + HOUR }),
    ];
    expect(splitCreatorDeals(items).nextUp?.id).toBe('soon');
  });

  it('has no next up when nothing else has a deadline', () => {
    expect(splitCreatorDeals([deal()]).nextUp).toBeNull();
    expect(splitCreatorDeals([])).toEqual({ waiting: [], nextUp: null });
  });
});
