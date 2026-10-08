import type { CatalogService, RateCardCatalog } from '@/core/api';
import type { RateCard } from '@/domains/auth';
import {
  emptyRateCardForm,
  findRushAddon,
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
  addons: ['rush_delivery'],
};

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
  const values = {
    ...emptyRateCardForm('instagram'),
    service: 'reel' as const,
    packageValue: '60',
    price: { amount: 12050, currency: 'USD' as const },
    retention: '30d' as const,
    rushEnabled: true,
    rushHours: 48,
    rushPrice: { amount: 3000, currency: 'USD' as const },
  };

  it('sends the catalog package type, rush first, no hidden attributes', () => {
    expect(toRateCardInput(values, reel)).toEqual({
      platform: 'instagram',
      service: 'reel',
      package_value: 60,
      price_usd: 120.5,
      delivery_days: 5,
      revisions: 1,
      retention: '30d',
      addons: [{ type: 'rush_delivery', pricing_mode: 'fixed', amount: 30, options: { delivery_hours: 48 } }],
    });
  });

  it('sends no platform, package or retention for an on-site visit', () => {
    expect(
      toRateCardInput(
        { ...values, group: 'in_person', service: 'on_site_visit', packageValue: null, retention: null },
        visit,
      ),
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
    expect(toRateCardPatch(toRateCardForm(card()), card(), reel)).toEqual({});
  });

  it('sends only what changed', () => {
    const values = { ...toRateCardForm(card()), price: { amount: 15000, currency: 'USD' as const }, deliveryDays: 7 };
    expect(toRateCardPatch(values, card(), reel)).toEqual({ price_usd: 150, delivery_days: 7 });
  });

  it('replaces the add-on list when rush changes, keeping the others', () => {
    const withOther = card({
      addons: [
        ...card().addons,
        {
          type: 'pin',
          label: 'Pin',
          pricing_mode: 'fixed',
          amount: 10,
          computed_price_usd: 10,
          options: {},
        },
      ],
    });
    const values = { ...toRateCardForm(withOther), rushEnabled: false };
    expect(toRateCardPatch(values, withOther, reel)).toEqual({
      addons: [{ type: 'pin', pricing_mode: 'fixed', amount: 10, options: {} }],
    });
  });
});

describe('findRushAddon', () => {
  const catalog = {
    addons: [
      {
        type: 'rush_delivery',
        label: 'Rush delivery',
        pricing_modes: [{ key: 'fixed', label: 'Fixed', min: 0.01, max: 50000 }],
        options: [{ key: 'delivery_hours', options: [{ value: 24 }, { value: 48 }], default: 48, visible: true }],
      },
    ],
  } as unknown as RateCardCatalog;

  it('reads the fixed price range and the delivery windows', () => {
    expect(findRushAddon(catalog)).toEqual({
      label: 'Rush delivery',
      min: 0.01,
      max: 50000,
      hours: [
        { value: 24, label: null },
        { value: 48, label: null },
      ],
      defaultHours: 48,
    });
  });

  it('is null when the catalog has no rush add-on', () => {
    expect(findRushAddon({ addons: [] } as unknown as RateCardCatalog)).toBeNull();
  });
});
