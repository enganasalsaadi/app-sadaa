import type { TFunction } from 'i18next';
import { createInfluencerAccountSchema } from '../influencerAccountSchema';
import type { InfluencerAccountFormValues } from '../influencerAccountSchema';
import {
  createInfluencerSocialsSchema,
  createPlatformAccountSchema,
  toHandle,
} from '../influencerSocialsSchema';
import {
  createInfluencerRatesSchema,
  fromPriceUsd,
  toPriceUsd,
} from '../influencerRatesSchema';
import type { RateRowFormValues } from '../influencerRatesSchema';

jest.mock('@/core/i18n', () => ({ formatMoney: () => '$50,000.00' }));

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown) => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

const validAccount: InfluencerAccountFormValues = {
  fullName: 'Ahmad Khalil',
  phone: '944123456',
  countryCode: 'SY',
  governorate: 'damascus',
  email: '',
  password: 'secret123',
  passwordConfirmation: 'secret123',
};

describe('createInfluencerAccountSchema', () => {
  const schema = createInfluencerAccountSchema(t);

  it('accepts a Syrian mobile with no email', () => {
    expect(() => schema.validateSync(validAccount)).not.toThrow();
  });

  it('rejects a valid non-Syrian number', () => {
    expect(
      messageOf(() =>
        schema.validateSync({ ...validAccount, countryCode: 'AE', phone: '501234567' }),
      ),
    ).toBe('auth.influencerOnboarding.account.phoneSyriaOnly');
  });

  it('requires a governorate', () => {
    expect(messageOf(() => schema.validateSync({ ...validAccount, governorate: '' }))).toBe(
      'validation.selectOne',
    );
  });

  it('validates an email only when given', () => {
    expect(messageOf(() => schema.validateSync({ ...validAccount, email: 'nope' }))).toBe(
      'validation.invalidEmail',
    );
  });

  it('checks the confirmation client-side', () => {
    expect(
      messageOf(() => schema.validateSync({ ...validAccount, passwordConfirmation: 'other123' })),
    ).toBe('validation.passwordMismatch');
  });
});

describe('toHandle', () => {
  it.each([
    ['  @ahmad_k ', 'ahmad_k'],
    ['https://instagram.com/ahmad.k/?hl=ar', 'ahmad.k'],
    ['https://www.tiktok.com/@ahmad', 'ahmad'],
    ['ahmad', 'ahmad'],
  ])('%s → %s', (input, expected) => {
    expect(toHandle(input)).toBe(expected);
  });
});

describe('createPlatformAccountSchema', () => {
  const schema = createPlatformAccountSchema(t);
  const draft = { tierSource: 'manual' as const, isPrimary: false };

  it('accepts a full account', () => {
    expect(() =>
      schema.validateSync({
        ...draft,
        platform: 'instagram',
        handle: '@ahmad',
        followerTier: 'MICRO',
      }),
    ).not.toThrow();
  });

  it('rejects website (brand-only) and bad handles', () => {
    expect(
      messageOf(() =>
        schema.validateSync({ ...draft, platform: 'website', handle: 'x', followerTier: 'NANO' }),
      ),
    ).toBe('validation.selectOne');
    expect(
      messageOf(() =>
        schema.validateSync({ ...draft, platform: 'tiktok', handle: 'a b', followerTier: 'NANO' }),
      ),
    ).toBe('auth.influencerOnboarding.socials.errors.username');
  });

  it('needs a follower tier unless a lookup found the account', () => {
    expect(
      messageOf(() =>
        schema.validateSync({ ...draft, platform: 'tiktok', handle: 'ahmad', followerTier: '' }),
      ),
    ).toBe('auth.influencerOnboarding.socials.errors.tier');
    expect(() =>
      schema.validateSync({
        platform: 'tiktok',
        handle: 'ahmad',
        followerTier: '',
        tierSource: 'auto',
        isPrimary: true,
      }),
    ).not.toThrow();
  });
});

describe('createInfluencerSocialsSchema', () => {
  const schema = createInfluencerSocialsSchema(t);
  const account = {
    platform: 'instagram' as const,
    handle: 'ahmad',
    followerTier: 'MICRO' as const,
    tierSource: 'manual' as const,
    isPrimary: false,
  };

  it('needs 1–3 niches and at least one platform', () => {
    expect(() => schema.validateSync({ niches: ['beauty'], platforms: [account] })).not.toThrow();
    expect(messageOf(() => schema.validateSync({ niches: [], platforms: [account] }))).toBe(
      'auth.influencerOnboarding.socials.errors.nichesMin',
    );
    expect(
      messageOf(() => schema.validateSync({ niches: ['a', 'b', 'c', 'd'], platforms: [account] })),
    ).toBe('auth.influencerOnboarding.socials.errors.nichesMax');
    expect(messageOf(() => schema.validateSync({ niches: ['a'], platforms: [] }))).toBe(
      'auth.influencerOnboarding.socials.errors.platformsMin',
    );
  });

  it('rejects the same platform twice', () => {
    expect(
      messageOf(() => schema.validateSync({ niches: ['a'], platforms: [account, account] })),
    ).toBe('auth.influencerOnboarding.socials.errors.duplicate');
  });
});

describe('rates', () => {
  const schema = createInfluencerRatesSchema(t);
  const row = (overrides: Partial<RateRowFormValues>): RateRowFormValues => ({
    platform: 'instagram',
    service: 'reels',
    enabled: false,
    price: null,
    ...overrides,
  });

  it('converts minor units to API dollars without float drift', () => {
    expect(toPriceUsd({ amount: 5000, currency: 'USD' })).toBe(50);
    expect(toPriceUsd({ amount: 1999, currency: 'USD' })).toBe(19.99);
    expect(toPriceUsd({ amount: 5, currency: 'USD' })).toBe(0.05);
  });

  it('round-trips API dollars back to minor units', () => {
    expect(fromPriceUsd(19.99)).toEqual({ amount: 1999, currency: 'USD' });
    expect(fromPriceUsd(50)).toEqual({ amount: 5000, currency: 'USD' });
    expect(fromPriceUsd(Number.NaN)).toBeNull();
  });

  it('needs at least one enabled service', () => {
    expect(messageOf(() => schema.validateSync({ rates: [row({})] }))).toBe(
      'auth.influencerOnboarding.rates.errors.minOne',
    );
  });

  it('requires a positive price on enabled rows only', () => {
    expect(messageOf(() => schema.validateSync({ rates: [row({ enabled: true })] }))).toBe(
      'auth.influencerOnboarding.rates.errors.price',
    );
    expect(() =>
      schema.validateSync({
        rates: [row({ enabled: true, price: { amount: 5000, currency: 'USD' } }), row({ service: 'story' })],
      }),
    ).not.toThrow();
  });

  it('catches a slipped zero above the ceiling', () => {
    expect(
      messageOf(() =>
        schema.validateSync({
          rates: [row({ enabled: true, price: { amount: 50_000_01, currency: 'USD' } })],
        }),
      ),
    ).toBe('auth.influencerOnboarding.rates.errors.tooHigh');
  });
});
