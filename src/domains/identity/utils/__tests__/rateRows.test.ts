import type { PlatformResource, RateCard } from '@/domains/auth';
import { buildRateRows } from '../rateRows';

// The barrel pulls navigators and UI; only the price helper is needed here.
jest.mock('@/domains/auth', () => ({
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

const card = (
  p: string | null,
  service: RateCard['service']['key'],
  price: number,
  overrides: Partial<RateCard> = {},
): RateCard => ({
  id: `${p}:${service}`,
  slot_key: `${p ?? 'none'}:${service}`,
  platform: p,
  service: { key: service, label: `svc:${service}` },
  package: null,
  price_usd: price,
  delivery_days: 5,
  revisions: 1,
  retention: null,
  attributes: [],
  addons: [],
  includes: [],
  ...overrides,
});

describe('buildRateRows', () => {
  const platforms = [platform('tiktok', 'TikTok'), platform('instagram', 'Instagram', true)];

  it('puts the primary platform first and in-person services last', () => {
    const rows = buildRateRows(
      [
        card(null, 'on_site_visit', 200),
        card('tiktok', 'video', 30),
        card('instagram', 'story', 20),
        card('instagram', 'reel', 50),
      ],
      platforms,
    );
    expect(rows.map(row => row.key)).toEqual([
      'instagram:story',
      'instagram:reel',
      'tiktok:video',
      'none:on_site_visit',
    ]);
  });

  it('labels from the card and platforms, with prices in minor units', () => {
    const [row] = buildRateRows(
      [
        card('instagram', 'reel', 49.5, {
          package: { key: 'duration_sec', value: 60, label: 'Up to 60 seconds' },
          includes: ['Up to 60 seconds'],
        }),
      ],
      platforms,
    );
    expect(row).toMatchObject({
      platformLabel: 'Instagram',
      serviceLabel: 'svc:reel',
      packageLabel: 'Up to 60 seconds',
      price: { amount: 4950, currency: 'USD' },
      includes: ['Up to 60 seconds'],
    });
  });

  it('has no platform label for in-person services, the key for unknown platforms', () => {
    expect(buildRateRows([card(null, 'on_site_visit', 5)], platforms)[0]?.platformLabel).toBeNull();
    expect(buildRateRows([card('youtube', 'shorts', 5)], platforms)[0]?.platformLabel).toBe('youtube');
  });

  it('maps add-ons from the server-computed price', () => {
    const [row] = buildRateRows(
      [
        card('instagram', 'reel', 100, {
          addons: [
            {
              type: 'rush_delivery',
              label: 'Rush delivery',
              pricing_mode: 'fixed',
              amount: 30,
              computed_price_usd: 30,
              options: { delivery_hours: 48 },
            },
          ],
        }),
      ],
      platforms,
    );
    expect(row?.addons).toEqual([
      { key: 'rush_delivery', label: 'Rush delivery', price: { amount: 3000, currency: 'USD' }, deliveryHours: 48 },
    ]);
  });

  it('drops a card with an unusable price', () => {
    expect(buildRateRows([card('instagram', 'reel', Number.NaN)], platforms)).toEqual([]);
  });
});
