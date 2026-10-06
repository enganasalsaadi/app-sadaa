import type { Money } from '@/core/money';
import type {
  MediaKitPlatform,
  MediaKitStats,
  StatMetric,
} from '../types/mediaKit';

/** Card shows the first three niches (plan §3). */
export const MAX_CARD_NICHES = 3;

/** Metrics the Home card can show, in display order (plan §3). Shares stay on the Insights screen. */
export const MEDIA_KIT_TILE_KEYS = [
  'profile_views',
  'unique_brand_views',
  'link_opens',
  'offers_from_profile',
] as const;
export type MediaKitTileKey = (typeof MEDIA_KIT_TILE_KEYS)[number];

/** `StatTile` change: a fraction (`0.12` = +12%), `'new'` when there is nothing to compare to, `undefined` = hide. */
export type MediaKitTileChange = number | 'new' | undefined;

/** Every §17.7 metric, as the server names it. */
export type MediaKitMetricKey =
  | 'profile_views'
  | 'unique_brand_views'
  | 'link_opens'
  | 'shares'
  | 'search_impressions'
  | 'offers_from_profile';

export interface MediaKitTile<K extends MediaKitMetricKey = MediaKitTileKey> {
  key: K;
  value: number;
  change: MediaKitTileChange;
}

/**
 * `change_pct` is `null` when the previous period was 0 (§17.7). With views that
 * means "new"; with no views either side there is nothing new, so no label.
 */
export const resolveStatChange = (metric: StatMetric): MediaKitTileChange => {
  if (metric.change_pct !== null) {
    return metric.change_pct / 100;
  }
  return metric.value > 0 ? 'new' : undefined;
};

/** A `null` metric is a feature that isn't live yet (§17.7): its tile is hidden, never shown as 0. */
export const buildMetricTiles = <K extends MediaKitMetricKey>(
  stats: MediaKitStats,
  keys: readonly K[],
): MediaKitTile<K>[] =>
  keys.flatMap(key => {
    const metric: StatMetric | null = stats[key];
    return metric
      ? [{ key, value: metric.value, change: resolveStatChange(metric) }]
      : [];
  });

export const buildMediaKitTiles = (stats: MediaKitStats): MediaKitTile[] =>
  buildMetricTiles(stats, MEDIA_KIT_TILE_KEYS);

/** Real zeros (not null metrics): the card swaps the tiles for a "share your link" prompt. */
export const hasNoActivity = (
  tiles: readonly MediaKitTile<MediaKitMetricKey>[],
): boolean => tiles.length > 0 && tiles.every(tile => tile.value === 0);

const MAX_TILES_PER_ROW = 3;

/** Three tiles fit one row; a fourth (offers, once live) makes it 2 × 2. */
export const splitTileRows = (
  tiles: readonly MediaKitTile[],
): MediaKitTile[][] => {
  if (tiles.length <= MAX_TILES_PER_ROW) {
    return tiles.length > 0 ? [[...tiles]] : [];
  }
  const rows: MediaKitTile[][] = [];
  for (let i = 0; i < tiles.length; i += 2) {
    rows.push(tiles.slice(i, i + 2));
  }
  return rows;
};

/** Server sorts the primary first; fall back to the first platform when none is flagged. */
export const pickPrimaryPlatform = (
  platforms: readonly MediaKitPlatform[],
): MediaKitPlatform | null =>
  platforms.find(p => p.is_primary) ?? platforms[0] ?? null;

/** Rate cards are priced in USD major units (§17.4); money is integer minor units (rule 06). */
export const toPriceFrom = (priceUsd: number | null): Money | null =>
  priceUsd === null
    ? null
    : { amount: Math.round(priceUsd * 100), currency: 'USD' };

/** Niche keys → local lookup labels (an unknown key shows as itself), capped for the card by default. */
export const labelNiches = (
  keys: readonly string[],
  options: readonly { value: string; label: string }[],
  limit: number = MAX_CARD_NICHES,
): string[] => {
  const labels = new Map(options.map(option => [option.value, option.label]));
  return keys.slice(0, limit).map(key => labels.get(key) ?? key);
};

/** `https://host/c/anas` → `host/c/anas`: the protocol is noise in a compact link row. */
export const formatLinkLabel = (publicUrl: string): string =>
  publicUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
