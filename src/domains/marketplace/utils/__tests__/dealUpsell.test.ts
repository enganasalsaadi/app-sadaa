import type { TFunction } from 'i18next';
import { toUpsellBody } from '../../api/dealUpsellApi';
import type { DealUpsell, DealUpsellStatus } from '../../types';
import { dealUpsellsView, dealUpsellTone, formatUpsellLine, itemAddonChoices } from '../dealUpsell';
import type { OfferService } from '../offerServices';

jest.mock('@/core/api', () => ({ baseApi: { injectEndpoints: () => ({}) } }));

const upsell = (id: string, status: DealUpsellStatus | null, proposedAt: number | null): DealUpsell => ({
  id,
  kind: { key: 'deliverable', label: '' },
  status: { key: status, label: '' },
  itemId: null,
  title: 'Reel',
  quantity: 1,
  addon: null,
  deliveryHours: null,
  amount: { amount: 4500, currency: 'USD' },
  addendumId: null,
  addedItemIds: [],
  reviewPaused: false,
  dueAt: null,
  declineReason: null,
  note: null,
  voidReason: null,
  proposedAt,
  closedAt: null,
});

describe('toUpsellBody', () => {
  it('sends a new deliverable as one line', () => {
    expect(
      toUpsellBody({ kind: 'deliverable', rateCardId: 'rc1', quantity: 2, addons: ['usage_rights'] }, 'dev'),
    ).toEqual({
      kind: 'deliverable',
      line: { rate_card_id: 'rc1', quantity: 2, addons: ['usage_rights'] },
      device_id: 'dev',
    });
  });

  it('sends an add-on on an item, unsigned for the quote', () => {
    expect(toUpsellBody({ kind: 'addon', itemId: 'it1', addonType: 'usage_rights' })).toEqual({
      kind: 'addon',
      item_id: 'it1',
      addon: { type: 'usage_rights' },
    });
  });

  it('sends an extra revision on an item', () => {
    expect(toUpsellBody({ kind: 'extra_revision', itemId: 'it1' }, 'dev')).toEqual({
      kind: 'extra_revision',
      item_id: 'it1',
      device_id: 'dev',
    });
  });
});

describe('dealUpsellsView', () => {
  it('lifts the pending one out and orders the rest newest first', () => {
    const view = dealUpsellsView({
      upsells: [upsell('a', 'accepted', 1), upsell('b', 'pending', 3), upsell('c', 'declined', 2)],
      upsellWindow: { open: false, closedReason: 'pending', pendingUpsellId: 'b' },
    });
    expect(view.pending?.id).toBe('b');
    expect(view.history.map(entry => entry.id)).toEqual(['c', 'a']);
  });

  it('has nothing pending once every upsell is answered', () => {
    const view = dealUpsellsView({
      upsells: [upsell('a', 'lapsed', null)],
      upsellWindow: { open: true, closedReason: null, pendingUpsellId: null },
    });
    expect(view.pending).toBeNull();
    expect(view.history).toHaveLength(1);
  });
});

describe('dealUpsellTone', () => {
  it('tones answers, keeps closed ones quiet', () => {
    expect(dealUpsellTone(upsell('a', 'accepted', 0))).toBe('success');
    expect(dealUpsellTone(upsell('a', 'declined', 0))).toBe('danger');
    expect(dealUpsellTone(upsell('a', 'pending', 0))).toBe('info');
    expect(dealUpsellTone(upsell('a', 'voided', 0))).toBe('neutral');
    expect(dealUpsellTone(upsell('a', null, 0))).toBe('neutral');
  });
});

describe('itemAddonChoices', () => {
  const service = {
    addons: [
      { type: 'usage_rights', label: 'Usage', price: { amount: 1000, currency: 'USD' }, detail: null },
      { type: 'rush_delivery', label: 'Rush', price: { amount: 500, currency: 'USD' }, detail: null },
    ],
  } as unknown as OfferService;

  it('offers only what the item does not carry yet', () => {
    const item = { addons: [{ type: 'rush_delivery', label: '', price: { amount: 0, currency: 'USD' as const }, options: {}, upsellId: null }] };
    expect(itemAddonChoices(item, service).map(addon => addon.type)).toEqual(['usage_rights']);
  });

  it('offers nothing once the card is gone from the kit', () => {
    expect(itemAddonChoices({ addons: [] }, undefined)).toEqual([]);
  });
});

describe('formatUpsellLine', () => {
  const t = ((key: string, values?: Record<string, unknown>) =>
    `${key}|${JSON.stringify(values ?? {})}`) as unknown as TFunction;
  const base = upsell('u1', 'pending', 1);

  it('shows the quantity only above one', () => {
    expect(formatUpsellLine(t, { ...base, quantity: 1 })).toBe('Reel');
    expect(formatUpsellLine(t, { ...base, quantity: 3 })).toContain('upsells.line|{"title":"Reel","count":3}');
  });

  it('pairs an add-on with its deliverable', () => {
    const addon = { type: 'rush', label: 'Rush', price: base.amount, options: {} };
    const kind = { key: 'addon' as const, label: '' };
    expect(formatUpsellLine(t, { ...base, kind, addon })).toContain('"label":"Rush","title":"Reel"');
  });

  it('falls back when the server sends no title', () => {
    expect(formatUpsellLine(t, { ...base, title: null })).toContain('upsells.fallbackTitle');
  });
});
