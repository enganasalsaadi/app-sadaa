import type { DealWindows } from '../types/dealOffer';

/** Server `config('deals.limits')`: the builder mirrors them so a bad line never reaches the API. */
export const DEAL_OFFER_LIMITS = {
  maxQuantityPerLine: 10,
  maxItemsPerDeal: 20,
  maxRequestedDeliveryDays: 90,
} as const;

/** Server `config('deals.brief')`. */
export const DEAL_BRIEF_LIMITS = {
  maxEntries: 10,
  maxEntryLength: 300,
  maxPromoCodeLength: 50,
  maxTrackingLinkLength: 2048,
} as const;

/**
 * `config('deals.sla_hours')` as of B2, used only when a quote predates `windows` (and by the
 * guide, which has no quote). The live quote always wins.
 */
export const DEFAULT_DEAL_WINDOWS: DealWindows = {
  influencerResponseHours: 48,
  paymentTopUpHours: 24,
  brandShipHours: 120,
  brandReviewHours: 48,
  publishWindowHours: 48,
};

/** The creator's one deadline extension goes at most this far (`deals.limits.max_extension_days`). */
export const DEAL_MAX_EXTENSION_DAYS = 14;
/** How long an untouched draft lives server-side (`deals.limits.draft_ttl_days`). */
export const DEAL_DRAFT_TTL_DAYS = 30;
/** How many times the brand may ask for a corrected live link. */
export const DEAL_FIX_REQUESTS = 2;
