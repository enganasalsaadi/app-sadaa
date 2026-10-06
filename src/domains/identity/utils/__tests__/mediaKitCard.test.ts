import type { MediaKitPlatform, MediaKitStats, StatMetric } from '../../types/mediaKit';
import {
  buildMediaKitTiles,
  formatLinkLabel,
  hasNoActivity,
  labelNiches,
  pickPrimaryPlatform,
  resolveStatChange,
  splitTileRows,
  toPriceFrom,
} from '../mediaKitCard';
import type { MediaKitTile } from '../mediaKitCard';

const metric = (value: number, previous: number, change_pct: number | null): StatMetric => ({
  value,
  previous,
  change_pct,
});

const stats = (overrides: Partial<MediaKitStats> = {}): MediaKitStats => ({
  period: '30d',
  range: { from: '2026-09-07T00:00:00+03:00', to: '2026-10-06T11:40:00+03:00' },
  generated_at: '2026-10-06T08:40:00Z',
  profile_views: { ...metric(1240, 1107, 12), series: [] },
  unique_brand_views: metric(38, 30, 26.7),
  link_opens: metric(96, 0, null),
  shares: metric(14, 9, 55.6),
  search_impressions: null,
  offers_from_profile: null,
  top_portfolio_items: [],
  brand_locations: [],
  ...overrides,
});

const tile = (key: MediaKitTile['key'], value = 1): MediaKitTile => ({
  key,
  value,
  change: undefined,
});

const platform = (overrides: Partial<MediaKitPlatform>): MediaKitPlatform => ({
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'anas',
  profile_url: null,
  display_name: null,
  follower_count: 100,
  follower_count_verified: false,
  follower_tier: null,
  follower_tier_label: null,
  is_primary: false,
  ...overrides,
});

describe('resolveStatChange', () => {
  it('turns change_pct into a fraction', () => {
    expect(resolveStatChange(metric(1240, 1107, 12))).toBeCloseTo(0.12);
    expect(resolveStatChange(metric(5, 10, -50))).toBeCloseTo(-0.5);
  });

  it('keeps a flat 0% as 0 (not "new")', () => {
    expect(resolveStatChange(metric(10, 10, 0))).toBe(0);
  });

  it('is "new" when there is no previous period to compare', () => {
    expect(resolveStatChange(metric(96, 0, null))).toBe('new');
  });

  it('shows nothing when both periods are empty', () => {
    expect(resolveStatChange(metric(0, 0, null))).toBeUndefined();
  });
});

describe('buildMediaKitTiles', () => {
  it('hides the metrics that are not live (null), never shows them as 0', () => {
    const tiles = buildMediaKitTiles(stats());
    expect(tiles.map(t => t.key)).toEqual(['profile_views', 'unique_brand_views', 'link_opens']);
  });

  it('adds the offers tile once the backend returns it', () => {
    const tiles = buildMediaKitTiles(stats({ offers_from_profile: metric(4, 2, 100) }));
    expect(tiles.map(t => t.key)).toEqual([
      'profile_views',
      'unique_brand_views',
      'link_opens',
      'offers_from_profile',
    ]);
    expect(tiles[3]).toEqual({ key: 'offers_from_profile', value: 4, change: 1 });
  });

  it('never surfaces search impressions or shares on the card', () => {
    const tiles = buildMediaKitTiles(stats({ search_impressions: metric(9, 1, 800) }));
    expect(tiles.map(t => t.key)).not.toContain('search_impressions');
    expect(tiles.map(t => t.key)).not.toContain('shares');
  });

  it('marks a metric without a previous period as "new"', () => {
    const linkOpens = buildMediaKitTiles(stats()).find(t => t.key === 'link_opens');
    expect(linkOpens).toEqual({ key: 'link_opens', value: 96, change: 'new' });
  });
});

describe('hasNoActivity', () => {
  it('is true only when every shown metric is a real zero', () => {
    expect(hasNoActivity([tile('profile_views', 0), tile('link_opens', 0)])).toBe(true);
    expect(hasNoActivity([tile('profile_views', 0), tile('link_opens', 3)])).toBe(false);
  });

  it('is false with no tiles at all', () => {
    expect(hasNoActivity([])).toBe(false);
  });
});

describe('splitTileRows', () => {
  it('keeps up to three tiles on one row', () => {
    expect(splitTileRows([tile('profile_views'), tile('link_opens')])).toHaveLength(1);
    expect(
      splitTileRows([tile('profile_views'), tile('unique_brand_views'), tile('link_opens')]),
    ).toHaveLength(1);
  });

  it('lays four tiles out 2 × 2', () => {
    const rows = splitTileRows([
      tile('profile_views'),
      tile('unique_brand_views'),
      tile('link_opens'),
      tile('offers_from_profile'),
    ]);
    expect(rows.map(r => r.length)).toEqual([2, 2]);
  });

  it('returns no rows for no tiles', () => {
    expect(splitTileRows([])).toEqual([]);
  });
});

describe('pickPrimaryPlatform', () => {
  it('prefers the flagged primary', () => {
    const picked = pickPrimaryPlatform([
      platform({ username: 'a' }),
      platform({ username: 'b', is_primary: true }),
    ]);
    expect(picked?.username).toBe('b');
  });

  it('falls back to the first platform, or null when there are none', () => {
    expect(pickPrimaryPlatform([platform({ username: 'a' })])?.username).toBe('a');
    expect(pickPrimaryPlatform([])).toBeNull();
  });
});

describe('toPriceFrom', () => {
  it('converts USD major units to integer minor units', () => {
    expect(toPriceFrom(30)).toEqual({ amount: 3000, currency: 'USD' });
    expect(toPriceFrom(19.99)).toEqual({ amount: 1999, currency: 'USD' });
  });

  it('rounds away float noise', () => {
    expect(toPriceFrom(1.1)).toEqual({ amount: 110, currency: 'USD' });
  });

  it('is null when no rate card is priced', () => {
    expect(toPriceFrom(null)).toBeNull();
  });
});

describe('labelNiches', () => {
  const options = [
    { value: 'fashion', label: 'Fashion' },
    { value: 'beauty', label: 'Beauty' },
  ];

  it('labels keys from the lookup and caps at three', () => {
    expect(labelNiches(['fashion', 'beauty', 'food', 'tech'], options)).toEqual([
      'Fashion',
      'Beauty',
      'food',
    ]);
  });

  it('falls back to the key while lookups are not loaded', () => {
    expect(labelNiches(['fashion'], [])).toEqual(['fashion']);
  });
});

describe('formatLinkLabel', () => {
  it('drops the protocol and a trailing slash', () => {
    expect(formatLinkLabel('https://sada.app/c/anas')).toBe('sada.app/c/anas');
    expect(formatLinkLabel('http://sada.app/c/anas/')).toBe('sada.app/c/anas');
  });
});
