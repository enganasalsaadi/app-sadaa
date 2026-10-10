import type { ParseKeys } from 'i18next';
import type { PriceLockReason } from '@/domains/identity';
import type { ExploreFilters } from '../types/explore';

/** Short 🔒 line on a creator card, per lock reason; an unknown reason reads as "verify". */
export const PRICE_LOCK_LABEL = {
  kyc_required: 'marketplace.creator.priceLock.verify',
  kyc_rejected: 'marketplace.creator.priceLock.verify',
  kyc_pending: 'marketplace.creator.priceLock.pending',
  onboarding_incomplete: 'marketplace.creator.priceLock.completeProfile',
  account_suspended: 'marketplace.creator.priceLock.unavailable',
  brand_only: 'marketplace.creator.priceLock.unavailable',
} as const satisfies Record<PriceLockReason, ParseKeys>;

export const PRICE_LOCK_FALLBACK = PRICE_LOCK_LABEL.kyc_required;

/** Explore params only verified brands may send (handoff §3); a locked viewer gets `403 gated_parameter`. */
export const GATED_EXPLORE_PARAMS = ['priceMin', 'priceMax', 'withinBudget'] as const satisfies readonly (keyof ExploreFilters)[];
export const GATED_EXPLORE_SORTS = ['price_asc', 'price_desc'] as const satisfies readonly NonNullable<ExploreFilters['sort']>[];
