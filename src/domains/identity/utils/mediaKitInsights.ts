import type { MediaKitStats } from '../types/mediaKit';
import { buildMetricTiles } from './mediaKitCard';
import type { MediaKitTile } from './mediaKitCard';

/** Insights shows every metric the server reports, in this order (plan §Screens). */
export const INSIGHTS_TILE_KEYS = [
  'profile_views',
  'unique_brand_views',
  'link_opens',
  'shares',
  'search_impressions',
  'offers_from_profile',
] as const;
export type InsightsTileKey = (typeof INSIGHTS_TILE_KEYS)[number];
export type InsightsTile = MediaKitTile<InsightsTileKey>;

export const buildInsightsTiles = (stats: MediaKitStats): InsightsTile[] =>
  buildMetricTiles(stats, INSIGHTS_TILE_KEYS);

const TILES_PER_ROW = 2;

/** `StatTile` reads best two to a row; an odd last tile keeps half width (the caller pads the row). */
export const pairTiles = <T>(items: readonly T[]): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += TILES_PER_ROW) {
    rows.push(items.slice(i, i + TILES_PER_ROW));
  }
  return rows;
};

/** A line needs two days; a 1-point series says nothing a tile doesn't. */
export const MIN_SPARKLINE_POINTS = 2;

export interface DailyViews {
  values: number[];
  total: number;
  peak: number;
}

export const toDailyViews = (stats: MediaKitStats): DailyViews | null => {
  const values = stats.profile_views.series.map(point => point.value);
  if (values.length < MIN_SPARKLINE_POINTS) {
    return null;
  }
  return {
    values,
    total: stats.profile_views.value,
    peak: Math.max(...values),
  };
};

export interface BrandLocationRow {
  key: string;
  label: string;
  count: number;
  /** 0–1 for `ProgressBar`; the server's `share_pct` already sums to 100 (§17.7), so it is never re-normalised. */
  share: number;
}

export const toBrandLocationRows = (
  locations: MediaKitStats['brand_locations'],
): BrandLocationRow[] =>
  locations.map(({ key, label, count, share_pct }) => ({
    key,
    label,
    count,
    share: share_pct / 100,
  }));
