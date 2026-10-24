import { DEAL_STATUS } from '../../types';
import type { Deal, DealExtension, DealFunding, DealStatus } from '../../types';
import { formatClock } from '../dealTimer';
import {
  dealCommitments,
  dealDockKind,
  dealExtensionAsk,
  dealExtensionRange,
  dealFundingState,
} from '../dealRespond';

const status = (key: DealStatus) => ({ status: { key, label: key }, onHold: null });

const extension = (patch: Partial<DealExtension> = {}): DealExtension => ({
  addendumId: 'add-1',
  status: 'pending',
  fromHours: 168,
  toHours: 288,
  reason: 'Shoot needs a closed day',
  ...patch,
});

const funding = (patch: Partial<DealFunding> = {}): DealFunding => ({
  funded: false,
  reason: 'insufficient_funds',
  missing: { amount: 35000, currency: 'USD' },
  ...patch,
});

describe('dealDockKind', () => {
  it('gives each role its bar while the offer is open', () => {
    expect(dealDockKind(status('pending_influencer'), 'creator')).toBe('creatorOffer');
    expect(dealDockKind(status('pending_influencer'), 'brand')).toBe('brandOffer');
    expect(dealDockKind(status('negotiating_deadline'), 'brand')).toBe('brandExtension');
    expect(dealDockKind(status('awaiting_payment'), 'brand')).toBe('brandFunding');
  });

  it('has no bar on an account hold', () => {
    expect(dealDockKind({ ...status('pending_influencer'), onHold: { since: 1 } }, 'creator')).toBeNull();
    expect(dealDockKind({ ...status('awaiting_payment'), onHold: { since: 1 } }, 'brand')).toBeNull();
  });

  it('shows the creator nothing while the brand decides or pays', () => {
    expect(dealDockKind(status('negotiating_deadline'), 'creator')).toBeNull();
    expect(dealDockKind(status('awaiting_payment'), 'creator')).toBeNull();
  });

  it('has no bar past the offer, or for an unknown status', () => {
    const later = DEAL_STATUS.filter(
      key => !['pending_influencer', 'negotiating_deadline', 'awaiting_payment'].includes(key),
    );
    for (const key of later) {
      expect(dealDockKind(status(key), 'brand')).toBeNull();
      expect(dealDockKind(status(key), 'creator')).toBeNull();
    }
    expect(dealDockKind({ status: { key: null, label: '?' }, onHold: null }, 'creator')).toBeNull();
  });
});

describe('dealExtensionRange', () => {
  it('runs from one day past today up to fourteen more', () => {
    expect(dealExtensionRange({ deliveryHours: 168, extension: null })).toEqual({ current: 7, min: 8, max: 21 });
  });

  it('counts whole days like the server', () => {
    expect(dealExtensionRange({ deliveryHours: 60, extension: null })).toEqual({ current: 2, min: 3, max: 16 });
  });

  it('is gone once used or without a window', () => {
    expect(dealExtensionRange({ deliveryHours: 168, extension: extension() })).toBeNull();
    expect(dealExtensionRange({ deliveryHours: null, extension: null })).toBeNull();
    expect(dealExtensionRange({ deliveryHours: 0, extension: null })).toBeNull();
  });
});

describe('dealExtensionAsk', () => {
  it('reads the pending ask', () => {
    expect(dealExtensionAsk({ extension: extension() })).toEqual({
      fromHours: 168,
      toHours: 288,
      reason: 'Shoot needs a closed day',
    });
  });

  it('drops an ask it cannot draw', () => {
    expect(dealExtensionAsk({ extension: null })).toBeNull();
    expect(dealExtensionAsk({ extension: extension({ toHours: null }) })).toBeNull();
    expect(dealExtensionAsk({ extension: extension({ toHours: 168 }) })).toBeNull();
  });
});

describe('dealFundingState', () => {
  it('sends a short wallet to top up', () => {
    expect(dealFundingState(funding())).toBe('short');
  });

  it('sends a frozen wallet to support, whatever is missing', () => {
    expect(dealFundingState(funding({ reason: 'wallet_frozen' }))).toBe('frozen');
    expect(dealFundingState(funding({ reason: 'wallet_frozen', missing: { amount: 0, currency: 'USD' } }))).toBe(
      'frozen',
    );
  });

  it('retries funding when nothing is missing or the server sent no funding', () => {
    expect(dealFundingState(funding({ reason: null, missing: { amount: 0, currency: 'USD' } }))).toBe('ready');
    expect(dealFundingState(null)).toBe('ready');
  });
});

describe('dealCommitments', () => {
  const item = (title: string, patch: Partial<Deal['items'][number]> = {}) =>
    ({ title, revisionsAllowed: 2, retention: '30d', ...patch }) as Deal['items'][number];
  const deal = (items: Deal['items'], shipping: Deal['shippingMode']['key'] = 'none') => ({
    items,
    deliveryHours: 168,
    shippingMode: { key: shipping, label: '' },
  });

  it('groups the deliverables by title, in order', () => {
    expect(dealCommitments(deal([item('Reel'), item('Story'), item('Reel')])).lines).toEqual([
      { title: 'Reel', count: 2 },
      { title: 'Story', count: 1 },
    ]);
  });

  it('keeps terms every item shares and drops mixed ones', () => {
    expect(dealCommitments(deal([item('Reel'), item('Story')]))).toMatchObject({ revisions: 2, retention: '30d' });
    expect(
      dealCommitments(deal([item('Reel'), item('Story', { revisionsAllowed: 1, retention: null })])),
    ).toMatchObject({ revisions: null, retention: null });
  });

  it('knows when a product ships first', () => {
    expect(dealCommitments(deal([item('Reel')], 'gift')).hasProduct).toBe(true);
    expect(dealCommitments(deal([item('Reel')])).hasProduct).toBe(false);
  });
});

describe('formatClock', () => {
  it('shows hours past a day and pads the rest', () => {
    expect(formatClock(31 * 3600 + 20 * 60 + 5)).toBe('31:20:05');
    expect(formatClock(59)).toBe('00:00:59');
    expect(formatClock(-4)).toBe('00:00:00');
  });
});
