import type { TFunction } from 'i18next';
import type { CatalogService } from '@/core/api';
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
  addons: ['rush_delivery'],
};

const schema = createRateCardSchema(t, {
  service: story,
  bounds: { min: 500, max: 5_000_000 },
  rushBounds: { min: 1, max: 5_000_000 },
});

const valid: RateCardFormValues = {
  group: 'instagram',
  service: 'story',
  packageValue: '1',
  price: { amount: 4000, currency: 'USD' },
  deliveryDays: 5,
  revisions: 1,
  retention: '24h',
  rushEnabled: false,
  rushHours: null,
  rushPrice: null,
};

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
    const rush = { ...valid, rushEnabled: true, rushPrice: { amount: 3000, currency: 'USD' as const } };
    expect(messageOf({ ...rush, rushHours: null })).toBe('validation.selectOne');
    expect(messageOf({ ...rush, deliveryDays: 2, rushHours: 48 })).toBe(
      'account.rates.editor.errors.rushTooSlow',
    );
    expect(messageOf({ ...rush, deliveryDays: 3, rushHours: 48 })).toBeNull();
    expect(messageOf({ ...rush, rushHours: 24, rushPrice: null })).toBe(
      'auth.influencerOnboarding.rates.errors.price',
    );
  });
});
