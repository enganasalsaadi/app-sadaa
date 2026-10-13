import type { TFunction } from 'i18next';
import type { CatalogService, RateCardCatalog } from '@/core/api';
import { addonDefinitions } from '../../utils/rateCardAddonForm';
import { createRateCardSchema, type RateCardFormValues } from '../rateCardSchema';

jest.mock('@/core/i18n', () => ({ formatMoney: () => '$5.00' }));
// The barrel pulls navigators and UI; only the pure helpers are needed here.
jest.mock('@/domains/auth', () => ({
  ...jest.requireActual<object>('@/domains/auth/schemas/influencerRatesSchema'),
  ...jest.requireActual<object>('@/domains/auth/utils/rateCatalog'),
}));

const t = ((key: string) => key) as unknown as TFunction;

const story: CatalogService = {
  key: 'story',
  label: 'Story',
  package: {
    key: 'frames',
    label: 'Frames',
    type: 'options',
    options: [{ value: 1, label: '1 frame' }],
    default: 1,
    visible: true,
  },
  criteria: {
    delivery_days: { label: 'Delivery', min: 1, max: 14, default: 5 },
    revisions: { label: 'Revisions', options: [{ value: 1, label: '1' }], default: 1 },
    retention: { label: 'Live', options: [{ value: '24h', label: '24h' }], default: '24h', minimum: '24h' },
  },
  attributes: [],
  addons: ['rush_delivery', 'link_in_bio'],
};

const fixed = [{ key: 'fixed', label: 'Fixed', min: 0.01, max: 50000 }];
const catalog = {
  addons: [
    {
      type: 'rush_delivery',
      label: 'Rush',
      pricing_modes: fixed,
      options: [{ key: 'delivery_hours', options: [{ value: 24 }, { value: 48 }], default: 48, visible: true }],
    },
    {
      type: 'link_in_bio',
      label: 'Link in bio',
      pricing_modes: fixed,
      options: [{ key: 'duration_days', options: [{ value: 7 }, { value: 30 }], default: 7, visible: true }],
    },
  ],
} as unknown as RateCardCatalog;

const schema = createRateCardSchema(t, {
  service: story,
  bounds: { min: 500, max: 5_000_000 },
  addons: addonDefinitions(catalog, story),
});

const valid: RateCardFormValues = {
  group: 'instagram',
  service: 'story',
  packageValue: '1',
  price: { amount: 4000, currency: 'USD' },
  deliveryDays: 5,
  revisions: 1,
  retention: '24h',
  addons: [
    { type: 'rush_delivery', enabled: false, options: {}, price: null },
    { type: 'link_in_bio', enabled: false, options: {}, price: null },
  ],
};

const withAddon = (index: number, row: Partial<RateCardFormValues['addons'][number]>, deliveryDays = 5) => ({
  ...valid,
  deliveryDays,
  addons: valid.addons.map((addon, i) => (i === index ? { ...addon, enabled: true, ...row } : addon)),
});

const messageOf = (values: RateCardFormValues) => {
  try {
    schema.validateSync(values);
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('rate card schema', () => {
  it('accepts a complete card', () => {
    expect(messageOf(valid)).toBeNull();
  });

  it('needs a package and a retention when the service has them', () => {
    expect(messageOf({ ...valid, packageValue: null })).toBe('validation.selectOne');
    expect(messageOf({ ...valid, retention: null })).toBe('validation.selectOne');
  });

  it('keeps the price inside the catalog bounds', () => {
    expect(messageOf({ ...valid, price: { amount: 499, currency: 'USD' } })).toBe(
      'auth.influencerOnboarding.rates.errors.tooLow',
    );
  });

  it('keeps delivery days inside the catalog range', () => {
    expect(messageOf({ ...valid, deliveryDays: 15 })).toBe('account.rates.editor.errors.deliveryDays');
  });

  it('only allows rush strictly faster than delivery', () => {
    const price = { amount: 3000, currency: 'USD' as const };
    expect(messageOf(withAddon(0, { price, options: {} }))).toBe('validation.selectOne');
    expect(messageOf(withAddon(0, { price, options: { delivery_hours: '48' } }, 2))).toBe(
      'account.rates.editor.errors.rushTooSlow',
    );
    expect(messageOf(withAddon(0, { price, options: { delivery_hours: '48' } }, 3))).toBeNull();
    expect(messageOf(withAddon(0, { price: null, options: { delivery_hours: '24' } }))).toBe(
      'auth.influencerOnboarding.rates.errors.price',
    );
  });

  it('needs a catalog option value and a fee for an enabled add-on, nothing when off', () => {
    const price = { amount: 1000, currency: 'USD' as const };
    expect(messageOf(withAddon(1, { price, options: { duration_days: '30' } }))).toBeNull();
    expect(messageOf(withAddon(1, { price, options: { duration_days: '14' } }))).toBe('validation.selectOne');
    expect(messageOf(withAddon(1, { price: { amount: 0, currency: 'USD' }, options: { duration_days: '7' } }))).toBe(
      'auth.influencerOnboarding.rates.errors.tooLow',
    );
    expect(messageOf({ ...withAddon(1, { price: null }), addons: valid.addons })).toBeNull();
  });
});
