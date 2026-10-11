import type { MediaKitPlatform, PublicMediaKit, PublicRateCard } from '../../types/mediaKit';
import type { LockableRateRow } from '../rateRows';
import {
  buildServiceGroups,
  buildShowcaseMetrics,
  fastestDeliveryDays,
  IN_PERSON_GROUP,
  sumFollowers,
  sumSelectedPrices,
  toShowcaseAudience,
  toWorkedWith,
  topAgeRange,
} from '../mediaKitShowcase';

jest.mock('@/core/i18n', () => ({
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
    options?.style === 'percent' ? `${Math.round(value * 1000) / 10}%` : String(value),
}));

const platform = (overrides: Partial<MediaKitPlatform>): MediaKitPlatform => ({
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'anas',
  profile_url: null,
  display_name: null,
  follower_count: 1000,
  follower_count_verified: true,
  follower_tier: null,
  follower_tier_label: null,
  is_primary: true,
  ...overrides,
});

const card = (overrides: Partial<PublicRateCard>): PublicRateCard => ({
  id: 'c1',
  slot_key: 'instagram:reel:30',
  platform: 'instagram',
  service: { key: 'reel', label: 'Reel' },
  package: null,
  price_usd: 45,
  delivery_days: 3,
  revisions: 2,
  retention: { key: 'permanent', label: 'Permanent' },
  attributes: [],
  addons: [],
  includes: [],
  ...overrides,
});

const row = (key: string, platformKey: string | null, amount: number | null): LockableRateRow => ({
  key,
  platform: platformKey,
  platformLabel: platformKey === null ? null : platformKey.toUpperCase(),
  serviceLabel: key,
  packageLabel: null,
  price: amount === null ? null : { amount, currency: 'USD' },
  includes: [],
  addons: [],
});

const kit = (overrides: Partial<PublicMediaKit> = {}): PublicMediaKit => ({
  slug: 'anas',
  display_name: 'Anas',
  avatar_url: null,
  tier: null,
  tier_label: null,
  is_verified: false,
  niches: [],
  platforms: [platform({ follower_count: 45000 }), platform({ platform: 'tiktok', follower_count: 1200, is_primary: false })],
  rate_cards: [card({ delivery_days: 5 }), card({ slot_key: 'b', delivery_days: 2 })],
  price_from_usd: 22,
  contract_terms: null,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
  cover_url: null,
  city: null,
  public_url: 'https://sada.sy/c/anas',
  is_shortlisted: null,
  highlights: null,
  audience: null,
  worked_with: null,
  ...overrides,
});

describe('mediaKitShowcase', () => {
  it('sums followers over every platform; none → null', () => {
    expect(sumFollowers(kit().platforms)).toBe(46200);
    expect(sumFollowers([])).toBeNull();
  });

  it('fastest delivery ignores zero days', () => {
    expect(fastestDeliveryDays([{ delivery_days: 0 }, { delivery_days: 4 }, { delivery_days: 2 }])).toBe(2);
    expect(fastestDeliveryDays([])).toBeNull();
  });

  it('today (no v2 highlights) → reach, fastest delivery, platforms only', () => {
    expect(buildShowcaseMetrics(kit())).toEqual([
      { key: 'reach', value: '46200' },
      { key: 'fastestDelivery', value: '2' },
      { key: 'platforms', value: '2' },
    ]);
  });

  it('v2 highlights lead, missing ones are skipped, capped at four', () => {
    const metrics = buildShowcaseMetrics(
      kit({
        highlights: {
          engagement_rate_pct: 5.2,
          avg_views: null,
          local_audience_pct: 78,
          completed_campaigns: 0,
        },
      }),
    );
    expect(metrics.map(m => m.key)).toEqual(['reach', 'engagement', 'localAudience', 'fastestDelivery']);
    expect(metrics[1]?.value).toBe('5.2%');
  });

  it('groups services by platform in row order, in-person last, with card terms', () => {
    const cards = [
      card({ slot_key: 'ig', delivery_days: 3, revisions: 1 }),
      card({ slot_key: 'visit', platform: null, retention: null }),
      card({ slot_key: 'tt', platform: 'tiktok' }),
    ];
    const groups = buildServiceGroups(
      [row('ig', 'instagram', 4500), row('tt', 'tiktok', 3000), row('visit', null, null), row('gone', 'instagram', 1)],
      cards,
    );
    expect(groups.map(g => g.key)).toEqual(['instagram', 'tiktok', IN_PERSON_GROUP]);
    expect(groups[0]?.services).toHaveLength(1);
    expect(groups[0]?.services[0]).toMatchObject({ deliveryDays: 3, revisions: 1, retentionLabel: 'Permanent' });
    expect(groups[2]?.label).toBeNull();
    expect(groups[2]?.services[0]?.retentionLabel).toBeNull();
  });

  it('estimates the picked base prices; locked picks and nothing picked → null', () => {
    const groups = buildServiceGroups(
      [row('a', 'instagram', 4500), row('b', 'instagram', 2200), row('c', 'tiktok', null)],
      [card({ slot_key: 'a' }), card({ slot_key: 'b' }), card({ slot_key: 'c', platform: 'tiktok' })],
    );
    expect(sumSelectedPrices(groups, new Set(['a', 'b']))).toEqual({ amount: 6700, currency: 'USD' });
    expect(sumSelectedPrices(groups, new Set(['c']))).toBeNull();
    expect(sumSelectedPrices(groups, new Set())).toBeNull();
  });

  it('audience shows only with some data; top age = biggest bucket', () => {
    expect(toShowcaseAudience(null)).toBeNull();
    const empty = { cities: [], gender: null, age_ranges: [], source_label: 'Instagram', updated_at: '' };
    expect(toShowcaseAudience(empty)).toBeNull();
    const ages = [
      { key: '18-24', label: '18–24', share_pct: 42 },
      { key: '25-34', label: '25–34', share_pct: 35 },
    ];
    expect(toShowcaseAudience({ ...empty, age_ranges: ages })).not.toBeNull();
    expect(topAgeRange(ages)?.key).toBe('18-24');
    expect(topAgeRange([])).toBeNull();
  });

  it('brands worked with: hidden until there is one', () => {
    expect(toWorkedWith(undefined)).toBeNull();
    expect(toWorkedWith({ total_brands: 0, items: [] })).toBeNull();
    const worked = {
      total_brands: 3,
      items: [{ id: 'b1', name: 'Zara Home', logo_url: null, is_verified: true, completed_campaigns: 2 }],
    };
    expect(toWorkedWith(worked)).toBe(worked);
  });
});
