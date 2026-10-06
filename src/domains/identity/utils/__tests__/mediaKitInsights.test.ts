import type { MediaKitStats, StatMetric } from '../../types/mediaKit';
import {
  buildInsightsTiles,
  pairTiles,
  toBrandLocationRows,
  toDailyViews,
} from '../mediaKitInsights';

const metric = (
  value: number,
  previous: number,
  change_pct: number | null,
): StatMetric => ({
  value,
  previous,
  change_pct,
});

const stats = (overrides: Partial<MediaKitStats> = {}): MediaKitStats => ({
  period: '7d',
  range: { from: '2026-09-30T00:00:00+03:00', to: '2026-10-06T11:40:00+03:00' },
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

describe('buildInsightsTiles', () => {
  it('shows every live metric, shares included, in display order', () => {
    expect(buildInsightsTiles(stats())).toEqual([
      { key: 'profile_views', value: 1240, change: 0.12 },
      { key: 'unique_brand_views', value: 38, change: 0.267 },
      { key: 'link_opens', value: 96, change: 'new' },
      { key: 'shares', value: 14, change: 0.556 },
    ]);
  });

  it('hides null metrics and shows them once the server sends them', () => {
    const tiles = buildInsightsTiles(
      stats({
        search_impressions: metric(0, 0, null),
        offers_from_profile: metric(3, 1, 200),
      }),
    );
    expect(tiles.map(t => t.key)).toEqual([
      'profile_views',
      'unique_brand_views',
      'link_opens',
      'shares',
      'search_impressions',
      'offers_from_profile',
    ]);
    expect(tiles[4]?.change).toBeUndefined();
    expect(tiles[5]?.change).toBe(2);
  });
});

describe('pairTiles', () => {
  it('lays tiles out two to a row, the odd one alone at the end', () => {
    expect(pairTiles([1, 2, 3, 4, 5])).toEqual([[1, 2], [3, 4], [5]]);
    expect(pairTiles([])).toEqual([]);
  });
});

describe('toDailyViews', () => {
  it('maps the series to values with total and peak', () => {
    const daily = toDailyViews(
      stats({
        profile_views: {
          ...metric(9, 0, null),
          series: [
            { date: '2026-10-05', value: 2 },
            { date: '2026-10-06', value: 7 },
          ],
        },
      }),
    );
    expect(daily).toEqual({ values: [2, 7], total: 9, peak: 7 });
  });

  it('returns null when there are fewer than two days to draw', () => {
    expect(toDailyViews(stats())).toBeNull();
    expect(
      toDailyViews(
        stats({
          profile_views: {
            ...metric(3, 0, null),
            series: [{ date: '2026-10-06', value: 3 }],
          },
        }),
      ),
    ).toBeNull();
  });
});

describe('toBrandLocationRows', () => {
  it('uses share_pct as-is, as a 0–1 fraction', () => {
    expect(
      toBrandLocationRows([
        { key: 'damascus', label: 'دمشق', count: 21, share_pct: 55.3 },
        { key: 'other', label: 'أخرى', count: 8, share_pct: 21 },
      ]),
    ).toEqual([
      {
        key: 'damascus',
        label: 'دمشق',
        count: 21,
        share: expect.closeTo(0.553),
      },
      { key: 'other', label: 'أخرى', count: 8, share: expect.closeTo(0.21) },
    ]);
  });

  it('returns no rows while fewer than 3 brands viewed the kit', () => {
    expect(toBrandLocationRows([])).toEqual([]);
  });
});
