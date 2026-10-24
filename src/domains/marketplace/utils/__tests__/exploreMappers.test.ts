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
      rating: null,
      completion: null,
      response: null,
      price: {
        locked: false,
        from: { amount: 4000, currency: 'USD' },
        fromSypApprox: { amount: 600000, currency: 'SYP' },
      },
      isShortlisted: false,
    });
  });

  it('maps the public track record and hides what is below the server threshold', () => {
    const card = mapExploreCreator(
      creatorDto({
        rating: { average: 4.7, count: 12 },
        completion: { rate: 92, count: 12 },
        response: { bucket: 'within_hour', label: 'يرد عادةً خلال ساعة' },
      }),
    );
    expect(card.rating).toEqual({ average: 4.7, count: 12 });
    expect(card.completion).toEqual({ rate: 92, count: 12 });
    expect(card.response).toEqual({ bucket: 'within_hour', label: 'يرد عادةً خلال ساعة' });
    const hidden = mapExploreCreator(creatorDto({ rating: null, completion: null, response: null }));
    expect([hidden.rating, hidden.completion, hidden.response]).toEqual([null, null, null]);
  });

  it('drops a malformed track record instead of showing it wrong', () => {
    const card = mapExploreCreator(
      creatorDto({
        rating: { average: Number.NaN, count: 4 },
        completion: { rate: 140, count: 5 },
        response: { bucket: 'someday' as 'within_day', label: 'Soon' },
      }),
    );
    expect(card.rating).toBeNull();
    expect(card.completion).toBeNull();
    expect(card.response).toEqual({ bucket: null, label: 'Soon' });
    expect(mapExploreCreator(creatorDto({ rating: { average: 4, count: 0 } })).rating).toBeNull();
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

  it('reads the rating buckets, empty on a server that predates them', () => {
    expect(mapExploreFilters(dto).ratingBuckets).toEqual([]);
    expect(mapExploreFilters({ ...dto, rating_buckets: [option(4), option(4.5)] }).ratingBuckets.map(b => b.value)).toEqual([
      '4',
      '4.5',
    ]);
  });

  it('keeps the rating sort', () => {
    expect(mapExploreFilters({ ...dto, sort: [option('rating_desc')] }).sorts.map(sort => sort.value)).toEqual([
      'rating_desc',
    ]);
  });

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
    expect(home.island).toEqual({
      type: 'verify_account',
      title: 'Verify',
      body: 'See prices',
      ctaLabel: 'Start',
      waitingDeals: null,
    });
    expect(home.supportWhatsappUrl).toBe('https://wa.me/963962401604');
    expect(home.viewPrices).toEqual({ allowed: false, reason: 'kyc_required' });
  });

  it('drops empty and unknown rails, parses see_all', () => {
    const { rails } = mapBrandHome(homeDto());
    expect(rails.map(rail => rail.key)).toEqual(['near_you', 'recently_viewed']);
    expect(rails[0]?.seeAll).toEqual({ governorate: ['damascus'] });
    expect(rails[1]?.seeAll).toBeNull();
  });

  it('keeps the top_rated rail and its see-all (min rating + rating sort)', () => {
    const { rails } = mapBrandHome(
      homeDto({
        rails: [
          {
            key: 'top_rated',
            title: 'Top rated',
            items: [creatorDto()],
            see_all: { min_rating: 4.5, sort: 'rating_desc' },
          },
        ],
      }),
    );
    expect(rails.map(rail => rail.key)).toEqual(['top_rated']);
    expect(rails[0]?.seeAll).toEqual({ minRating: 4.5, sort: 'rating_desc' });
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

  it('maps the fund_deals island with its waiting deals', () => {
    const home = mapBrandHome(
      homeDto({
        island: {
          type: 'fund_deals',
          title: 'Fund',
          body: '1 offer waits',
          cta: { label: 'Top up', action: 'top_up' },
          meta: { count: 1, expires_at: '2026-10-16T09:00:00+03:00', campaign_count: 1 },
        },
      }),
    );
    expect(home.island?.waitingDeals).toEqual({
      count: 1,
      expiresAt: Date.parse('2026-10-16T09:00:00+03:00'),
      campaignCount: 1,
    });
  });

  it('ignores meta on other islands and a bad expiry', () => {
    const other = mapBrandHome(
      homeDto({
        island: {
          type: 'verify_account',
          title: 'Verify',
          body: '',
          cta: { label: 'Start', action: 'verify_account' },
          meta: { count: 3, expires_at: null },
        },
      }),
    );
    expect(other.island?.waitingDeals).toBeNull();
    const bad = mapBrandHome(
      homeDto({
        island: {
          type: 'fund_deals',
          title: 'Fund',
          body: '',
          cta: { label: 'Top up', action: 'top_up' },
          meta: { count: 2, expires_at: 'soon' },
        },
      }),
    );
    expect(bad.island?.waitingDeals).toEqual({ count: 2, expiresAt: null, campaignCount: 0 });
  });

  it('maps active deals, keeps the server counts and drops a row with bad money', () => {
    const row = {
      id: '01J',
      status: { key: 'in_progress', label: 'In progress' },
      stage: { key: 'draft_submitted', label: 'Draft submitted' },
      creator: { slug: 'reem', name: 'Reem', avatar_url: null },
      title: 'Instagram Reel +2',
      total_usd: '150.00',
      due_at: '2026-10-15T09:00:00+03:00',
      needs_action: true,
      action: { key: 'review_draft', label: 'Review the draft' },
    };
    const home = mapBrandHome(
      homeDto({
        active_deals: {
          needs_action_count: 2,
          total_count: 12,
          items: [row, { ...row, id: '01K', total_usd: 'abc' }],
        },
      }),
    );
    expect(home.activeDeals?.needsActionCount).toBe(2);
    expect(home.activeDeals?.totalCount).toBe(12);
    expect(home.activeDeals?.items.map(item => item.id)).toEqual(['01J']);
    expect(home.activeDeals?.items[0]?.action).toEqual({ key: 'review_draft', label: 'Review the draft' });
  });

  it('hides active deals when the server sends none', () => {
    expect(mapBrandHome(homeDto()).activeDeals).toBeNull();
    expect(mapBrandHome(homeDto({ active_deals: null })).activeDeals).toBeNull();
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
