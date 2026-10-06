import type { PlatformResource, RateCardEntry } from '@/domains/auth';
import { buildRateRows } from '../rateRows';

// The barrel pulls navigators and UI; only the enum and the price helper are needed here.
jest.mock('@/domains/auth', () => ({
  ...jest.requireActual<object>('@/domains/auth/store/authTypes'),
  fromPriceUsd: jest.requireActual<{ fromPriceUsd: unknown }>(
    '@/domains/auth/schemas/influencerRatesSchema',
  ).fromPriceUsd,
}));

const platform = (key: string, label: string, isPrimary = false): PlatformResource => ({
  id: key,
  platform: key,
  platform_label: label,
  username: 'leila',
  profile_url: null,
  display_name: null,
  follower_count: 1000,
  follower_tier: 'MICRO',
  follower_tier_label: null,
  tier_source: 'auto',
  verification_status: 'auto_verified',
  rejection_reason: null,
  is_primary: isPrimary,
  is_available: true,
  supports_lookup: true,
  last_synced_at: null,
});

const card = (p: string, service: RateCardEntry['service_type'], price: number): RateCardEntry => ({
  platform: p,
  service_type: service,
  price_usd: price,
});

const serviceLabel = (service: string) => `svc:${service}`;

describe('buildRateRows', () => {
  const platforms = [platform('tiktok', 'TikTok'), platform('instagram', 'Instagram', true)];

  it('orders primary platform first, then services in enum order', () => {
    const rows = buildRateRows(
      [card('tiktok', 'post', 10), card('instagram', 'story', 20), card('instagram', 'reels', 50)],
      platforms,
      serviceLabel,
    );
    expect(rows.map(r => r.key)).toEqual(['instagram:reels', 'instagram:story', 'tiktok:post']);
  });

  it('converts dollars to minor units', () => {
    const [row] = buildRateRows([card('instagram', 'reels', 49.5)], platforms, serviceLabel);
    expect(row?.price).toEqual({ amount: 4950, currency: 'USD' });
    expect(row?.platformLabel).toBe('Instagram');
    expect(row?.serviceLabel).toBe('svc:reels');
  });

  it('falls back to the platform key when the platform is not linked', () => {
    const [row] = buildRateRows([card('youtube', 'post', 5)], platforms, serviceLabel);
    expect(row?.platformLabel).toBe('youtube');
  });

  it('drops a card with an unusable price', () => {
    expect(buildRateRows([card('instagram', 'reels', Number.NaN)], platforms, serviceLabel)).toEqual([]);
  });
});
