import { GATED_EXPLORE_PARAMS, GATED_EXPLORE_SORTS } from '../constants/priceLock';
import type { ExploreFilters } from '../types/explore';
import { EXPLORE_QUERY_MAX, EXPLORE_QUERY_MIN } from './exploreQuery';

/** Server bounds for `max_delivery_days`. */
const DELIVERY_DAYS_MIN = 1;
const DELIVERY_DAYS_MAX = 14;

/** Filter sheet form: numbers stay text while typed, parsed once on apply. */
export interface ExploreFilterDraft {
  governorate: string[];
  platform: string[];
  niche: string[];
  tier: string[];
  minFollowers: string;
  maxFollowers: string;
  /** Delivery bucket value (days), `null` = any. */
  maxDeliveryDays: string | null;
  kycVerified: boolean;
  followersVerified: boolean;
  rush: boolean;
  onSite: boolean;
  priceMin: string;
  priceMax: string;
  withinBudget: boolean;
}

export type ExploreDraftList = 'governorate' | 'platform' | 'niche' | 'tier';
export type ExploreDraftText = 'minFollowers' | 'maxFollowers' | 'priceMin' | 'priceMax';
export type ExploreDraftFlag =
  | 'kycVerified'
  | 'followersVerified'
  | 'rush'
  | 'onSite'
  | 'withinBudget';

const isGatedSort = (sort: ExploreFilters['sort']) =>
  (GATED_EXPLORE_SORTS as readonly (string | undefined)[]).includes(sort);

/** True when the request would carry a 🔒 param or sort. */
export const hasGatedParams = (filters: ExploreFilters): boolean =>
  GATED_EXPLORE_PARAMS.some(key => filters[key] !== undefined && filters[key] !== false) ||
  isGatedSort(filters.sort);

/** Drops 🔒 params and sorts, e.g. after the server answers `403 gated_parameter`. */
export const stripGatedFilters = (filters: ExploreFilters): ExploreFilters => {
  const next: ExploreFilters = { ...filters };
  GATED_EXPLORE_PARAMS.forEach(key => delete next[key]);
  if (isGatedSort(next.sort)) {
    delete next.sort;
  }
  return next;
};

/** Filters set in the sheet (search, sort and the category chip are shown on their own). */
export const countSheetFilters = (filters: ExploreFilters): number =>
  [
    !!filters.governorate?.length,
    !!filters.platform?.length,
    !!filters.niche?.length,
    !!filters.tier?.length,
    filters.minFollowers !== undefined || filters.maxFollowers !== undefined,
    filters.maxDeliveryDays !== undefined,
    !!filters.kycVerified,
    !!filters.followersVerified,
    !!filters.rush,
    !!filters.onSite,
    filters.priceMin !== undefined || filters.priceMax !== undefined,
    !!filters.withinBudget,
  ].filter(Boolean).length;

/** Anything narrowing the list besides the search text ("Clear filters" has work to do). */
export const hasNarrowingFilters = (filters: ExploreFilters): boolean =>
  countSheetFilters(filters) > 0 || !!filters.category;

/** Keeps search and sort; drops the category and everything the sheet and quick chips set. */
export const clearNarrowingFilters = ({ q, sort }: ExploreFilters): ExploreFilters => {
  const next: ExploreFilters = {};
  if (q !== undefined) next.q = q;
  if (sort !== undefined) next.sort = sort;
  return next;
};

const toText = (value: number | undefined) => (value === undefined ? '' : String(value));

export const toFilterDraft = (filters: ExploreFilters): ExploreFilterDraft => ({
  governorate: filters.governorate ?? [],
  platform: filters.platform ?? [],
  niche: filters.niche ?? [],
  tier: filters.tier ?? [],
  minFollowers: toText(filters.minFollowers),
  maxFollowers: toText(filters.maxFollowers),
  maxDeliveryDays: filters.maxDeliveryDays === undefined ? null : String(filters.maxDeliveryDays),
  kycVerified: !!filters.kycVerified,
  followersVerified: !!filters.followersVerified,
  rush: !!filters.rush,
  onSite: !!filters.onSite,
  priceMin: toText(filters.priceMin),
  priceMax: toText(filters.priceMax),
  withinBudget: !!filters.withinBudget,
});

/** Typed digits only (Arabic-Indic too); anything else is ignored rather than rejected. */
export const sanitizeDigits = (text: string): string =>
  text
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');

const parseWhole = (text: string): number | undefined => {
  const digits = sanitizeDigits(text);
  return digits ? Number(digits) : undefined;
};

/** A reversed range is read the way it was meant (min ↔ max) instead of matching nothing. */
const orderRange = (min: number | undefined, max: number | undefined) =>
  min !== undefined && max !== undefined && min > max ? [max, min] : [min, max];

const setIfDefined = <K extends keyof ExploreFilters>(
  filters: ExploreFilters,
  key: K,
  value: ExploreFilters[K] | undefined,
) => {
  if (value !== undefined) filters[key] = value;
};

/** Sheet draft → filters; search, sort and category come from `current`. */
export const applyFilterDraft = (
  current: ExploreFilters,
  draft: ExploreFilterDraft,
): ExploreFilters => {
  const next: ExploreFilters = {};
  setIfDefined(next, 'q', current.q);
  setIfDefined(next, 'sort', current.sort);
  setIfDefined(next, 'category', current.category);

  (['governorate', 'platform', 'niche', 'tier'] as const).forEach(key => {
    if (draft[key].length > 0) next[key] = [...draft[key]];
  });
  const [minFollowers, maxFollowers] = orderRange(
    parseWhole(draft.minFollowers),
    parseWhole(draft.maxFollowers),
  );
  setIfDefined(next, 'minFollowers', minFollowers);
  setIfDefined(next, 'maxFollowers', maxFollowers);

  const days = draft.maxDeliveryDays === null ? undefined : parseWhole(draft.maxDeliveryDays);
  if (days !== undefined) {
    next.maxDeliveryDays = Math.min(Math.max(days, DELIVERY_DAYS_MIN), DELIVERY_DAYS_MAX);
  }
  (['kycVerified', 'followersVerified', 'rush', 'onSite', 'withinBudget'] as const).forEach(key => {
    if (draft[key]) next[key] = true;
  });
  const [priceMin, priceMax] = orderRange(parseWhole(draft.priceMin), parseWhole(draft.priceMax));
  setIfDefined(next, 'priceMin', priceMin);
  setIfDefined(next, 'priceMax', priceMax);
  return next;
};

/** Search text as the API takes it: trimmed, 2–60 chars, else no `q` at all. */
export const toSearchQuery = (text: string): string | undefined => {
  const q = text.trim().slice(0, EXPLORE_QUERY_MAX);
  return q.length >= EXPLORE_QUERY_MIN ? q : undefined;
};
