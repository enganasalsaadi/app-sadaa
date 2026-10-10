import { EXPLORE_SORTS, type ExploreFilters, type ExploreSort } from '../types/explore';

type KeysOfType<V> = {
  [K in keyof ExploreFilters]-?: NonNullable<ExploreFilters[K]> extends V ? K : never;
}[keyof ExploreFilters];

// [app key, server key]. Arrays go out as `key[]=a&key[]=b` (fetchBaseQuery would join them with commas).
const ARRAY_PARAMS: readonly [KeysOfType<string[]>, string][] = [
  ['governorate', 'governorate'],
  ['platform', 'platform'],
  ['niche', 'niche'],
  ['tier', 'tier'],
];
const NUMBER_PARAMS: readonly [KeysOfType<number>, string][] = [
  ['minFollowers', 'min_followers'],
  ['maxFollowers', 'max_followers'],
  ['maxDeliveryDays', 'max_delivery_days'],
  ['priceMin', 'price_min'],
  ['priceMax', 'price_max'],
];
const BOOLEAN_PARAMS: readonly [KeysOfType<boolean>, string][] = [
  ['kycVerified', 'kyc_verified'],
  ['followersVerified', 'followers_verified'],
  ['rush', 'rush'],
  ['onSite', 'on_site'],
  ['withinBudget', 'within_budget'],
];

/** Server bounds for `q`; shorter text is left out rather than sent and rejected. */
export const EXPLORE_QUERY_MIN = 2;
export const EXPLORE_QUERY_MAX = 60;

const pair = (key: string, value: string | number) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

/** `/explore/creators` query string. Unset and `false` filters are left out (no filter). */
export const buildExploreQuery = (
  filters: ExploreFilters,
  cursor: string | null,
  perPage: number,
): string => {
  const parts: string[] = [];
  const q = filters.q?.trim();
  if (q && q.length >= EXPLORE_QUERY_MIN) {
    parts.push(pair('q', q));
  }
  for (const [key, serverKey] of ARRAY_PARAMS) {
    filters[key]?.forEach(value => parts.push(pair(`${serverKey}[]`, value)));
  }
  if (filters.category) {
    parts.push(pair('category', filters.category));
  }
  for (const [key, serverKey] of NUMBER_PARAMS) {
    const value = filters[key];
    if (value !== undefined && Number.isFinite(value)) {
      parts.push(pair(serverKey, value));
    }
  }
  for (const [key, serverKey] of BOOLEAN_PARAMS) {
    if (filters[key]) {
      parts.push(pair(serverKey, 1));
    }
  }
  if (filters.sort) {
    parts.push(pair('sort', filters.sort));
  }
  parts.push(pair('per_page', perPage));
  if (cursor) {
    parts.push(pair('cursor', cursor));
  }
  return parts.join('&');
};

const toStringList = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : [value];
  return list.flatMap(item =>
    typeof item === 'string' || typeof item === 'number' ? [String(item)] : [],
  );
};

const toNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
};

const isTrue = (value: unknown) => value === true || value === 1 || value === '1' || value === 'true';

const isExploreSort = (value: unknown): value is ExploreSort =>
  typeof value === 'string' && (EXPLORE_SORTS as readonly string[]).includes(value);

/** Home rail `see_all` (server Explore params) → Explore prefill. Unknown keys and bad values are dropped. */
export const parseExploreParams = (raw: Record<string, unknown>): ExploreFilters => {
  const params = new Map(Object.entries(raw).map(([key, value]) => [key.replace(/\[\]$/, ''), value]));
  const filters: ExploreFilters = {};

  const q = params.get('q');
  if (typeof q === 'string' && q.trim()) {
    filters.q = q.trim();
  }
  for (const [key, serverKey] of ARRAY_PARAMS) {
    const list = toStringList(params.get(serverKey));
    if (list.length > 0) {
      filters[key] = list;
    }
  }
  const category = params.get('category');
  if (typeof category === 'string' && category) {
    filters.category = category;
  }
  for (const [key, serverKey] of NUMBER_PARAMS) {
    const value = toNumber(params.get(serverKey));
    if (value !== undefined) {
      filters[key] = value;
    }
  }
  for (const [key, serverKey] of BOOLEAN_PARAMS) {
    if (isTrue(params.get(serverKey))) {
      filters[key] = true;
    }
  }
  const sort = params.get('sort');
  if (isExploreSort(sort)) {
    filters.sort = sort;
  }
  return filters;
};
