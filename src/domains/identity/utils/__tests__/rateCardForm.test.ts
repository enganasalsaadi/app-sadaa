import type { CatalogService, RateCardCatalog } from '@/core/api';
import type { RateCard } from '@/domains/auth';
import type { RateCardFormValues } from '../../schemas/rateCardSchema';
import { addonDefinitions } from '../rateCardAddonForm';
import {
  emptyRateCardForm,
  hasFreeSlot,
  serviceDefaults,
  takenPackageKeys,
  toRateCardForm,
  toRateCardInput,
  toRateCardPatch,
} from '../rateCardForm';

// The barrel pulls navigators and UI; only the pure helpers are needed here.
jest.mock('@/domains/auth', () => ({
  ...jest.requireActual<object>('@/domains/auth/schemas/influencerRatesSchema'),
  ...jest.requireActual<object>('@/domains/auth/utils/rateCatalog'),
}));

const reel: CatalogService = {
  key: 'reel',
  label: 'Reel',
  package: {
    key: 'duration_sec',
    label: 'Length',
    type: 'options',
    options: [
      { value: 15, label: '15s' },
      { value: 30, label: '30s' },
      { value: 60, label: '60s' },
    ],
    default: 30,
    visible: true,
  },
  criteria: {
    delivery_days: { label: 'Delivery', min: 1, max: 14, default: 5 },
    revisions: { label: 'Revisions', options: [{ value: 1, label: '1' }], default: 1 },
    retention: { label: 'Live', options: [{ value: '30d', label: '30 days' }], default: '30d', minimum: '24h' },
  },
  attributes: [{ key: 'collab_post', label: 'Collab', type: 'boolean', default: false, visible: false }],
  addons: ['rush_delivery', 'pin'],
};

const catalog = {
  addons: [
    {
      type: 'rush_delivery',
      label: 'Rush delivery',
      pricing_modes: [{ key: 'fixed', label: 'Fixed', min: 0.01, max: 50000 }],
      options: [{ key: 'delivery_hours', options: [{ value: 24 }, { value: 48 }], default: 48, visible: true }],
    },
    {
      type: 'pin',
      label: 'Pin',
      pricing_modes: [{ key: 'fixed', label: 'Fixed', min: 0.01, max: 50000 }],
      options: [{ key: 'duration_days', options: [{ value: 7 }, { value: 30 }], default: 7, visible: true }],
    },
  ],
} as unknown as RateCardCatalog;
const defs = addonDefinitions(catalog, reel);

const visit: CatalogService = {
  ...reel,
  key: 'on_site_visit',
  package: null,
  criteria: { ...reel.criteria, retention: null },
  attributes: [],
  addons: [],
};

const card = (overrides: Partial<RateCard> = {}): RateCard => ({
  id: 'c1',
  slot_key: 'instagram:reel:60',
  platform: 'instagram',
  service: { key: 'reel', label: 'Reel' },
  package: { key: 'duration_sec', value: 60, label: '60s' },
  price_usd: 120,
  delivery_days: 5,
  revisions: 1,
  retention: { key: '30d', label: '30 days' },
  attributes: [],
  addons: [
    {
      type: 'rush_delivery',
      label: 'Rush',
      pricing_mode: 'fixed',
      amount: 30,
      computed_price_usd: 30,
      options: { delivery_hours: 48 },
    },
  ],
  includes: [],
  ...overrides,
});

describe('slots', () => {
  const cards = [card(), card({ id: 'c2', package: { key: 'duration_sec', value: 15, label: '15s' } })];

  it('lists priced packages, skipping the card being edited', () => {
    expect(takenPackageKeys(cards, 'instagram', 'reel')).toEqual(new Set(['60', '15']));
    expect(takenPackageKeys(cards, 'instagram', 'reel', 'c1')).toEqual(new Set(['15']));
    expect(takenPackageKeys(cards, 'tiktok', 'reel').size).toBe(0);
  });

  it('knows when a service is fully priced', () => {
    expect(hasFreeSlot(reel, new Set(['15', '60']))).toBe(true);
    expect(hasFreeSlot(reel, new Set(['15', '30', '60']))).toBe(false);
    const visitCard = card({ platform: null, service: { key: 'on_site_visit', label: 'Visit' }, package: null });
    expect(hasFreeSlot(visit, takenPackageKeys([visitCard], null, 'on_site_visit'))).toBe(false);
  });

  it('defaults to the catalog package, or the first free one', () => {
    expect(serviceDefaults(reel, new Set()).packageValue).toBe('30');
    expect(serviceDefaults(reel, new Set(['30'])).packageValue).toBe('15');
    expect(serviceDefaults(visit, new Set())).toEqual({
      packageValue: null,
      deliveryDays: 5,
      revisions: 1,
      retention: null,
    });
  });
});

describe('toRateCardInput', () => {
  const values: RateCardFormValues = {
    ...emptyRateCardForm('instagram'),
    service: 'reel',
    packageValue: '60',
    price: { amount: 12050, currency: 'USD' },
    retention: '30d',
    addons: [
      { type: 'rush_delivery', enabled: true, options: { delivery_hours: '48' }, price: { amount: 3000, currency: 'USD' } },
      { type: 'pin', enabled: false, options: {}, price: null },
    ],
  };

  it('sends the catalog package type, enabled add-ons only, no hidden attributes', () => {
    expect(toRateCardInput(values, reel, defs)).toEqual({
      body: {
        platform: 'instagram',
        service: 'reel',
        package_value: 60,
        price_usd: 120.5,
        delivery_days: 5,
        revisions: 1,
        retention: '30d',
        addons: [{ type: 'rush_delivery', pricing_mode: 'fixed', amount: 30, options: { delivery_hours: 48 } }],
      },
      addons: [
        { row: 0, input: { type: 'rush_delivery', pricing_mode: 'fixed', amount: 30, options: { delivery_hours: 48 } } },
      ],
    });
  });

  it('sends no platform, package or retention for an on-site visit', () => {
    expect(
      toRateCardInput(
        { ...values, group: 'in_person', service: 'on_site_visit', packageValue: null, retention: null, addons: [] },
        visit,
        [],
      )?.body,
    ).toEqual({
      platform: null,
      service: 'on_site_visit',
      price_usd: 120.5,
      delivery_days: 5,
      revisions: 1,
      addons: [],
    });
  });
});

describe('toRateCardPatch', () => {
  it('is empty when nothing changed', () => {
    expect(toRateCardPatch(toRateCardForm(card(), defs), card(), reel, defs)).toEqual({ body: {}, addons: [] });
  });

  it('sends only what changed', () => {
    const values = {
      ...toRateCardForm(card(), defs),
      price: { amount: 15000, currency: 'USD' as const },
      deliveryDays: 7,
    };
    expect(toRateCardPatch(values, card(), reel, defs).body).toEqual({ price_usd: 150, delivery_days: 7 });
  });

  it('replaces the add-on list when one changes, keeping the ones the editor does not show', () => {
    const withOther = card({
      addons: [
        ...card().addons,
        { type: 'hologram', label: 'Holo', pricing_mode: 'fixed', amount: 10, computed_price_usd: 10, options: {} },
      ],
    });
    const values: RateCardFormValues = {
      ...toRateCardForm(withOther, defs),
      addons: [
        { type: 'rush_delivery', enabled: false, options: { delivery_hours: '48' }, price: { amount: 3000, currency: 'USD' } },
        { type: 'pin', enabled: true, options: { duration_days: '30' }, price: { amount: 1500, currency: 'USD' } },
      ],
    };
    expect(toRateCardPatch(values, withOther, reel, defs)).toEqual({
      body: {
        addons: [
          { type: 'pin', pricing_mode: 'fixed', amount: 15, options: { duration_days: 30 } },
          { type: 'hologram', pricing_mode: 'fixed', amount: 10, options: {} },
        ],
      },
      addons: [{ row: 1, input: { type: 'pin', pricing_mode: 'fixed', amount: 15, options: { duration_days: 30 } } }],
    });
  });
});
