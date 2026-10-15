import type { BrandActiveDeal, DealItemStatus, DealStatus } from '../../types';
import { dealTrack, splitActiveDeals } from '../brandHomeDeals';

const deal = (
  status: DealStatus | null,
  stage: DealItemStatus | null = null,
  overrides: Partial<BrandActiveDeal> = {},
): BrandActiveDeal => ({
  id: 'd1',
  status: { key: status, label: 'server label' },
  stage: stage ? { key: stage, label: 'stage label' } : null,
  creator: { name: 'Reem', avatarUrl: null, slug: null },
  title: 'Instagram reel',
  total: { amount: 15000, currency: 'USD' },
  dueAt: null,
  needsAction: false,
  action: null,
  ...overrides,
});

describe('dealTrack', () => {
  it('folds the offer and funding phases into «agree»', () => {
    expect(dealTrack(deal('pending_influencer'))).toEqual({ stop: 0, stopped: false });
    expect(dealTrack(deal('awaiting_payment'))).toEqual({ stop: 0, stopped: false });
  });

  it('puts shipping and creating at «prepare»', () => {
    expect(dealTrack(deal('product_shipping')).stop).toBe(1);
    expect(dealTrack(deal('in_progress', 'draft_submitted')).stop).toBe(1);
  });

  it('lets the slowest item move an in-progress deal to «publish» and «done»', () => {
    expect(dealTrack(deal('in_progress', 'verifying_live')).stop).toBe(2);
    expect(dealTrack(deal('in_progress', 'verified')).stop).toBe(3);
  });

  it('marks a dispute stopped, at its slowest item or else «prepare»', () => {
    expect(dealTrack(deal('disputed'))).toEqual({ stop: 1, stopped: true });
    expect(dealTrack(deal('disputed', 'approved_to_publish'))).toEqual({ stop: 2, stopped: true });
  });

  it('keeps an unknown status at the start', () => {
    expect(dealTrack(deal(null))).toEqual({ stop: 0, stopped: false });
  });
});

describe('splitActiveDeals', () => {
  it('sends deals waiting on the brand to the card and keeps server order', () => {
    const a = deal('awaiting_payment', null, { id: 'a', needsAction: true });
    const b = deal('in_progress', 'pending', { id: 'b' });
    const c = deal('negotiating_deadline', null, { id: 'c', needsAction: true });
    const { waiting, moving } = splitActiveDeals([a, b, c]);
    expect(waiting.map(d => d.id)).toEqual(['a', 'c']);
    expect(moving.map(d => d.id)).toEqual(['b']);
  });
});
