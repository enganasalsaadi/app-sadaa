import type { BrandHomeDto, ExploreCreatorDto, ExploreFiltersDto } from '../../types/explore';
import {
  mapBrandHome,
  mapExploreCreator,
  mapExploreFilters,
  mapExplorePage,
  toSupportWhatsappUrl,
} from '../exploreMappers';
import { setShortlistedIn } from '../shortlistCache';

// The barrel pulls navigators and UI; only the price-lock helpers are read.
jest.mock('@/domains/identity', () => ({
  ...jest.requireActual<object>('@/domains/identity/utils/priceLock'),
  ...jest.requireActual<object>('@/domains/identity/constants/priceLock'),
}));

const creatorDto = (overrides: Partial<ExploreCreatorDto> = {}): ExploreCreatorDto => ({
  slug: 'reem',
  display_name: 'Reem',
  avatar_url: null,
  governorate: { value: 'aleppo', label: 'حلب' },
  niches: [{ value: 'food', label: 'طعام' }],
  tier: 'micro',
  tier_label: 'Micro',
  primary_platform: {
    platform: 'instagram',
    platform_label: 'Instagram',
    follower_count: 48200,
    follower_count_verified: true,
  },
  platforms: ['instagram'],
  badges: { kyc_verified: true, followers_verified: true, rush: false, on_site: true, new: true },
  fastest_delivery_days: 2,
  price: { locked: false, lock_reason: null, from_usd: 40, from_syp_approx: 600000, syp_rate_stale: false },
  is_shortlisted: false,
  ...overrides,
});

describe('mapExploreCreator', () => {
  it('maps an unlocked card', () => {
    expect(mapExploreCreator(creatorDto())).toEqual({
      slug: 'reem',
      displayName: 'Reem',
      avatarUrl: null,
      governorate: { value: 'aleppo', label: 'حلب' },
      niches: [{ value: 'food', label: 'طعام' }],
      tier: 'MICRO',
      primaryPlatform: {
        platform: 'instagram',
        platformLabel: 'Instagram',
        followerCount: 48200,
        followerCountVerified: true,
      },
      platforms: ['instagram'],
      badges: { kycVerified: true, followersVerified: true, rush: false, onSite: true, isNew: true },
      fastestDeliveryDays: 2,
      price: {
        locked: false,
        from: { amount: 4000, currency: 'USD' },
        fromSypApprox: { amount: 600000, currency: 'SYP' },
      },
      isShortlisted: false,
    });
  });

  it('hides SYP when the rate is stale', () => {
    const card = mapExploreCreator(
      creatorDto({
        price: { locked: false, lock_reason: null, from_usd: 40, from_syp_approx: 600000, syp_rate_stale: true },
      }),
    );
    expect(card.price).toEqual({ locked: false, from: { amount: 4000, currency: 'USD' }, fromSypApprox: null });
  });

  it('drops an unknown tier', () => {
    expect(mapExploreCreator(creatorDto({ tier: 'gold' })).tier).toBeNull();
  });

  it('turns server dollars into cents', () => {
    const card = mapExploreCreator(
      creatorDto({
        price: { locked: false, lock_reason: null, from_usd: 40.5, from_syp_approx: null, syp_rate_stale: false },
      }),
    );
    expect(card.price).toEqual({ locked: false, from: { amount: 4050, currency: 'USD' }, fromSypApprox: null });
  });

  it('maps a locked price with its reason, unknown reason → null', () => {
    const locked = (reason: string | null) =>
      mapExploreCreator(
        creatorDto({
          price: { locked: true, lock_reason: reason, from_usd: null, from_syp_approx: null, syp_rate_stale: false },
        }),
      ).price;
    expect(locked('kyc_pending')).toEqual({ locked: true, lockReason: 'kyc_pending' });
    expect(locked('vip_only')).toEqual({ locked: true, lockReason: null });
  });

  it('keeps a missing primary platform as null', () => {
    expect(mapExploreCreator(creatorDto({ primary_platform: null })).primaryPlatform).toBeNull();
  });
});

describe('mapExplorePage', () => {
  it('reads cursor and lock meta', () => {
    expect(
      mapExplorePage({
        data: [creatorDto()],
        meta: { next_cursor: 'c2', price_locked: true, price_lock_reason: 'kyc_required' },
      }),
    ).toMatchObject({ nextCursor: 'c2', priceLocked: true, priceLockReason: 'kyc_required' });
  });

  it('treats a missing or empty cursor as the end', () => {
    expect(mapExplorePage({ data: [], meta: {} })).toEqual({
      items: [],
      nextCursor: null,
      priceLocked: false,
      priceLockReason: null,
    });
    expect(mapExplorePage({ data: [], meta: { next_cursor: '' } }).nextCursor).toBeNull();
  });
});

describe('mapExploreFilters', () => {
  const option = (value: string | number, requires_verification?: boolean) => ({
    value,
    label: String(value),
    requires_verification,
  });
  const dto: ExploreFiltersDto = {
    governorates: [option('damascus')],
    platforms: [option('instagram')],
    niches: [option('food')],
    tiers: [option('gold')],
    categories: [{ ...option('food_drink'), niches: ['food', { value: 'cafes' }] }],
    sort: [option('recommended'), option('price_asc', true), option('cheapest')],
    delivery_buckets: [option(3)],
  };

  it('normalises values to strings and drops unknown sorts', () => {
    const filters = mapExploreFilters(dto);
    expect(filters.deliveryBuckets).toEqual([{ value: '3', label: '3', requiresVerification: false }]);
    expect(filters.categories[0]?.niches).toEqual(['food', 'cafes']);
    expect(filters.sorts.map(sort => [sort.value, sort.requiresVerification])).toEqual([
      ['recommended', false],
      ['price_asc', true],
    ]);
  });
});

describe('toSupportWhatsappUrl', () => {
  it.each([
    ['https://wa.me/963962401604', true],
    ['https://api.whatsapp.com/send?phone=963', true],
    ['https://WA.ME/963', true],
    ['http://wa.me/963', false],
    ['https://wa.me.evil.com/963', false],
    ['https://evil.com/?u=https://wa.me', false],
    ['ftp://wa.me/963', false],
  ])('%s → allowed %s', (url, allowed) => {
    expect(toSupportWhatsappUrl(url)).toBe(allowed ? url : null);
  });

  it('keeps null', () => {
    expect(toSupportWhatsappUrl(null)).toBeNull();
  });
});

describe('mapBrandHome', () => {
  const homeDto = (overrides: Partial<BrandHomeDto> = {}): BrandHomeDto => ({
    header: {
      company_name: 'Al Noor',
      governorate: { value: 'damascus', label: 'دمشق' },
      wallet: { available_usd: 1250, available_syp_approx: 18750000, syp_rate_stale: false },
    },
    island: {
      type: 'verify_account',
      title: 'Verify',
      body: 'See prices',
      cta: { label: 'Start', action: 'verify_account' },
    },
    rails: [
      { key: 'near_you', title: 'Near you', items: [creatorDto()], see_all: { 'governorate[]': ['damascus'] } },
      { key: 'verified', title: 'Verified', items: [], see_all: { kyc_verified: true } },
      { key: 'trending', title: 'Trending', items: [creatorDto()], see_all: null },
      { key: 'recently_viewed', title: 'Recent', items: [creatorDto()], see_all: null },
    ],
    support: { whatsapp_url: 'https://wa.me/963962401604' },
    capabilities: { view_prices: { allowed: false, reason: 'kyc_required' } },
    ...overrides,
  });

  it('maps header, island, support and price capability', () => {
    const home = mapBrandHome(homeDto());
    expect(home.companyName).toBe('Al Noor');
    expect(home.wallet).toEqual({
      available: { amount: 125000, currency: 'USD' },
      availableSypApprox: { amount: 18750000, currency: 'SYP' },
    });
    expect(home.island).toEqual({ type: 'verify_account', title: 'Verify', body: 'See prices', ctaLabel: 'Start' });
    expect(home.supportWhatsappUrl).toBe('https://wa.me/963962401604');
    expect(home.viewPrices).toEqual({ allowed: false, reason: 'kyc_required' });
  });

  it('drops empty and unknown rails, parses see_all', () => {
    const { rails } = mapBrandHome(homeDto());
    expect(rails.map(rail => rail.key)).toEqual(['near_you', 'recently_viewed']);
    expect(rails[0]?.seeAll).toEqual({ governorate: ['damascus'] });
    expect(rails[1]?.seeAll).toBeNull();
  });

  it('hides stale SYP, unknown island and non-WhatsApp support links', () => {
    const home = mapBrandHome(
      homeDto({
        header: {
          company_name: null,
          governorate: null,
          wallet: { available_usd: 0, available_syp_approx: 0, syp_rate_stale: true },
        },
        island: { type: 'promo', title: '', body: '', cta: { label: '', action: 'promo' } },
        support: { whatsapp_url: 'https://evil.com' },
      }),
    );
    expect(home.wallet.availableSypApprox).toBeNull();
    expect(home.island).toBeNull();
    expect(home.supportWhatsappUrl).toBeNull();
  });
});

describe('setShortlistedIn', () => {
  it('flips every copy of the creator only', () => {
    const cards = [
      mapExploreCreator(creatorDto()),
      mapExploreCreator(creatorDto({ slug: 'sami' })),
      mapExploreCreator(creatorDto()),
    ];
    setShortlistedIn(cards, 'reem', true);
    expect(cards.map(card => card.isShortlisted)).toEqual([true, false, true]);
  });
});
