// Brand Explore & Home (handoff 2026-10-10). DTOs mirror the server; domain models are what screens read.
import type { FollowerTierId } from '@/core/config';
import type { Money } from '@/core/money';
import type { ExploreFilters, ExploreSortParam } from '@/core/navigation';
import type { PriceLockReason } from '@/domains/identity';
import type { BrandActiveDeal, PublicRating, Timestamp } from './deal';
import type { BrandActiveDealDto } from './dealDto';
import type { BrandActiveCampaigns, BrandActiveCampaignsDto } from './campaignHome';

// Route params (Explore prefill) live in core navigation; the domain reads them as its own.
export type { ExploreFilters };

export const EXPLORE_SORTS = [
  'recommended',
  'followers_desc',
  'newest',
  'delivery_asc',
  'price_asc',
  'price_desc',
  'rating_desc',
] as const satisfies readonly ExploreSortParam[];
export type ExploreSort = (typeof EXPLORE_SORTS)[number];

export const BRAND_HOME_RAIL_KEYS = [
  'near_you',
  'top_rated',
  'verified',
  'fast_delivery',
  'new',
  'recently_viewed',
] as const;
export type BrandHomeRailKey = (typeof BRAND_HOME_RAIL_KEYS)[number];

export const BRAND_HOME_ISLAND_TYPES = [
  'kyc_rejected',
  'verify_account',
  'verification_pending',
  'fund_deals',
  'complete_profile',
] as const;
export type BrandHomeIslandType = (typeof BRAND_HOME_ISLAND_TYPES)[number];

// ── DTOs ────────────────────────────────────────────────────────────────

export interface LabeledValueDto {
  value: string;
  label: string;
}

export interface ExploreCreatorDto {
  slug: string;
  display_name: string;
  avatar_url: string | null;
  governorate: LabeledValueDto | null;
  niches: LabeledValueDto[];
  tier: string | null;
  tier_label: string | null;
  primary_platform: {
    platform: string;
    platform_label: string;
    follower_count: number;
    follower_count_verified: boolean;
  } | null;
  platforms: string[];
  badges: {
    kyc_verified: boolean;
    followers_verified: boolean;
    rush: boolean;
    on_site: boolean;
    new: boolean;
  };
  fastest_delivery_days: number | null;
  /** M4: brand scores on revealed deals; `null` below 3 ratings. */
  rating?: { average: number; count: number } | null;
  /** M4: own-fault completion %; `null` below 3 finished deals. */
  completion?: { rate: number; count: number } | null;
  /** M4: response badge (`within_hour` | `within_day` | `within_days`), server-localized label; `null` below 3 offers. */
  response?: { bucket: 'within_hour' | 'within_day' | 'within_days'; label: string } | null;
  price: {
    locked: boolean;
    lock_reason: string | null;
    from_usd: number | null;
    from_syp_approx: number | null;
    syp_rate_stale: boolean;
  };
  is_shortlisted: boolean;
}

/** Cursor list envelope (`withMeta`): no totals, no page numbers. */
export interface ExploreCreatorsPageDto {
  data: ExploreCreatorDto[];
  meta: {
    next_cursor?: string | null;
    price_locked?: boolean;
    price_lock_reason?: string | null;
  };
}

export interface ExploreOptionDto {
  value: string | number;
  label: string;
  requires_verification?: boolean;
}

export interface ExploreCategoryDto extends ExploreOptionDto {
  niches?: (string | { value: string | number })[];
}

export interface ExploreFiltersDto {
  governorates: ExploreOptionDto[];
  platforms: ExploreOptionDto[];
  niches: ExploreOptionDto[];
  tiers: ExploreOptionDto[];
  categories: ExploreCategoryDto[];
  sort: ExploreOptionDto[];
  delivery_buckets: ExploreOptionDto[];
  /** M4: `min_rating` chips (4, 4.5). */
  rating_buckets?: ExploreOptionDto[];
}

export interface BrandHomeDto {
  header: {
    company_name: string | null;
    governorate: LabeledValueDto | null;
    wallet: {
      available_usd: number;
      available_syp_approx: number | null;
      syp_rate_stale: boolean;
    };
  };
  island: {
    type: string;
    title: string;
    body: string;
    cta: { label: string; action: string };
    /** B13: `null` for every type except `fund_deals`; absent on older servers. */
    meta?: { count: number; expires_at: string | null; campaign_count?: number } | null;
  } | null;
  /** B13 §5.1: `null` when the brand has no open deal; absent on older servers. */
  active_deals?: {
    needs_action_count: number;
    total_count: number;
    items: BrandActiveDealDto[];
  } | null;
  /** Contract §6.1: `null` = flag off or nothing active. */
  active_campaigns?: BrandActiveCampaignsDto | null;
  rails: {
    key: string;
    title: string;
    items: ExploreCreatorDto[];
    see_all: Record<string, unknown> | null;
  }[];
  support: { whatsapp_url: string | null };
  capabilities: { view_prices: { allowed: boolean; reason: string | null } };
}

// ── Domain (`ExploreCreator` = handoff `CreatorCard`; that name is the UI component) ──

export interface LabeledValue {
  value: string;
  label: string;
}

/** Server dollars as `Money` (rule 06); SYP is `null` when the rate is stale. */
export type CreatorPrice =
  | { locked: true; lockReason: PriceLockReason | null }
  | { locked: false; from: Money | null; fromSypApprox: Money | null };

export interface ExploreCreator {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  governorate: LabeledValue | null;
  niches: LabeledValue[];
  /** Unknown server tier → `null` (no crest). */
  tier: FollowerTierId | null;
  primaryPlatform: {
    platform: string;
    platformLabel: string;
    followerCount: number;
    followerCountVerified: boolean;
  } | null;
  platforms: string[];
  badges: {
    kycVerified: boolean;
    followersVerified: boolean;
    rush: boolean;
    onSite: boolean;
    isNew: boolean;
  };
  fastestDeliveryDays: number | null;
  /** What brands gave them; `null` below 3 revealed ratings (show nothing). */
  rating: PublicRating | null;
  /** Own-fault completion; `null` below 3 finished deals. */
  completion: CreatorCompletion | null;
  /** Server-localized «usually replies within …»; `null` below 3 offers. */
  response: CreatorResponse | null;
  price: CreatorPrice;
  isShortlisted: boolean;
}

/** `rate` 0–100, floored by the server. */
export interface CreatorCompletion {
  rate: number;
  count: number;
}

export const CREATOR_RESPONSE_BUCKETS = ['within_hour', 'within_day', 'within_days'] as const;
export type CreatorResponseBucket = (typeof CREATOR_RESPONSE_BUCKETS)[number];

/** Unknown bucket → `null` key, the server label still shows. */
export interface CreatorResponse {
  bucket: CreatorResponseBucket | null;
  label: string;
}

export interface ExploreCreatorsPage {
  items: ExploreCreator[];
  nextCursor: string | null;
}

export interface ExplorePage extends ExploreCreatorsPage {
  priceLocked: boolean;
  priceLockReason: PriceLockReason | null;
}

export interface ExploreOption {
  value: string;
  label: string;
  requiresVerification: boolean;
}

export interface ExploreSortOption extends ExploreOption {
  value: ExploreSort;
}

export interface ExploreCategory extends ExploreOption {
  niches: string[];
}

export interface ExploreFilterOptions {
  governorates: ExploreOption[];
  platforms: ExploreOption[];
  niches: ExploreOption[];
  tiers: ExploreOption[];
  categories: ExploreCategory[];
  sorts: ExploreSortOption[];
  deliveryBuckets: ExploreOption[];
  /** `min_rating` chips; empty from a server that predates them. */
  ratingBuckets: ExploreOption[];
}

export interface BrandHomeIsland {
  type: BrandHomeIslandType;
  title: string;
  body: string;
  ctaLabel: string;
  /** `fund_deals` only: accepted offers waiting for money, the first to lapse at `expiresAt`. */
  waitingDeals: { count: number; expiresAt: Timestamp | null; campaignCount: number } | null;
}

/** B13 §5.1: open deals (≤ 10 shown); the counts cover every open deal. */
export interface BrandActiveDeals {
  needsActionCount: number;
  totalCount: number;
  items: BrandActiveDeal[];
}

export interface BrandHomeRail {
  key: BrandHomeRailKey;
  title: string;
  items: ExploreCreator[];
  /** Explore prefill for "See all"; `null` for `recently_viewed`. */
  seeAll: ExploreFilters | null;
}

export interface BrandHome {
  companyName: string | null;
  governorate: LabeledValue | null;
  /** Display only: the wallet tab reads `/wallet`. SYP is `null` when the rate is stale. */
  wallet: { available: Money; availableSypApprox: Money | null };
  island: BrandHomeIsland | null;
  /** `null` = no open deal: the strip hides. */
  activeDeals: BrandActiveDeals | null;
  /** `null` = flag off or no active campaign: the rail hides. */
  activeCampaigns: BrandActiveCampaigns | null;
  /** Non-empty rails only, in server order. */
  rails: BrandHomeRail[];
  /** Allow-listed WhatsApp link, else `null` (card hidden). */
  supportWhatsappUrl: string | null;
  viewPrices: { allowed: boolean; reason: PriceLockReason | null };
  /** Public Campaigns flag (contract §1.2): `active_campaigns` is `null` while it is off, and also for a brand with no active campaign (§6.1), so `false` here is not proof. */
  campaignsEnabled: boolean;
}

export interface SetShortlistedArgs {
  card: ExploreCreator;
  shortlisted: boolean;
}
