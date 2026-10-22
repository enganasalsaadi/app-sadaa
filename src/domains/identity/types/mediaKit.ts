import type { FollowerTierId } from '@/core/config';
import type { SocialPlatform } from '@/shared/utils';
import type { ContractTerms } from '@/core/api';
import type { RateCard } from '@/domains/auth';

/** Contract §17.9. */
export const STATS_PERIODS = ['7d', '30d', '90d'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export const VIEW_SOURCES = ['app', 'link', 'search', 'web'] as const;
export type ViewSource = (typeof VIEW_SOURCES)[number];

export const SHARE_CHANNELS = ['whatsapp', 'telegram', 'copy_link', 'other'] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export const SLUG_REASONS = ['invalid_length', 'invalid_format', 'reserved', 'taken'] as const;
export type SlugReason = (typeof SLUG_REASONS)[number];

export interface StatMetric {
  value: number;
  previous: number;
  change_pct: number | null;
}

export interface MediaKitPlatform {
  platform: SocialPlatform;
  platform_label: string;
  username: string;
  profile_url: string | null;
  display_name: string | null;
  follower_count: number;
  follower_count_verified: boolean;
  follower_tier: FollowerTierId | null;
  follower_tier_label: string | null;
  is_primary: boolean;
}

/** A rate card as another viewer sees it: every price `null` while prices are locked (brand-explore §6). */
export interface PublicRateCard extends Omit<RateCard, 'price_usd' | 'addons'> {
  price_usd: number | null;
  addons: (Omit<RateCard['addons'][number], 'amount' | 'computed_price_usd'> & {
    amount: number | null;
    computed_price_usd: number | null;
  })[];
}

/**
 * Media Kit v2 (contract §17.11). `highlights` (completed deals count) and `worked_with` are live
 * since Direct Deals B13 §5.4; `audience` and `top_portfolio_items` stay stubbed (`null` / `[]`).
 * Empty sections stay hidden and light up without an app release.
 */
export interface MediaKitCity {
  key: string;
  label: string;
}

/** Headline numbers, computed by the server from platform insights and completed deals. */
export interface MediaKitHighlights {
  /** Percent, 1 decimal (`5.2` = 5.2%). `null` = not enough data. */
  engagement_rate_pct: number | null;
  /** Average views per post over the last 30 days, all platforms. */
  avg_views: number | null;
  /** Percent of the audience inside Syria. */
  local_audience_pct: number | null;
  /** Deals completed in the app (status `completed`). */
  completed_campaigns: number;
}

export interface AudienceShare {
  key: string;
  label: string;
  /** Percent; one bucket list sums to 100. */
  share_pct: number;
}

export interface MediaKitAudience {
  /** Top cities first, smaller ones merged into `other`. */
  cities: AudienceShare[];
  gender: { female_pct: number; male_pct: number } | null;
  /** Age buckets in age order (`13-17`, `18-24`, …). */
  age_ranges: AudienceShare[];
  /** Localised source line ("Instagram insights"), shown under the card. */
  source_label: string;
  updated_at: string;
}

export interface MediaKitPortfolioItem {
  id: string;
  title: string | null;
  thumbnail_url: string;
  platform: SocialPlatform | null;
  views: number | null;
  brand_name: string | null;
}

/** A brand the creator finished at least one in-app campaign with (and that allows being shown). */
export interface MediaKitWorkedWithBrand {
  id: string;
  name: string;
  logo_url: string | null;
  is_verified: boolean;
  completed_campaigns: number;
}

export interface MediaKitWorkedWith {
  /**
   * All brands, including those beyond `items` or hidden by their own privacy setting
   * (`show_on_creator_profiles`): `items` shorter than this is normal.
   */
  total_brands: number;
  items: MediaKitWorkedWithBrand[];
}

export interface PublicMediaKit {
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: FollowerTierId | null;
  tier_label: string | null;
  is_verified: boolean;
  niches: string[];
  platforms: MediaKitPlatform[];
  /** Handoff §5 shape; platform cards only for available, non-rejected platforms. */
  rate_cards: PublicRateCard[];
  /** `null` while locked, or when the creator has no rate card. */
  price_from_usd: number | null;
  /**
   * Brand-explore §6: prices hidden from this viewer (anonymous, unverified brand, other
   * creator). Absent from the creator's own preview, which is never locked.
   */
  price_locked?: boolean;
  /** Raw server reason; read through `toPriceLockReason`. */
  price_lock_reason?: string | null;
  /** `null` from a server that predates Rate Cards v2. */
  contract_terms: ContractTerms | null;
  bio: string | null;
  top_portfolio_items: MediaKitPortfolioItem[];
  offers_from_profile: null;
  /** The creator's 5:2 banner (1500×600); `null` until uploaded. */
  cover_url: string | null;
  city: MediaKitCity | null;
  /** Absolute `/c/{slug}` link, for the brand-side Share. */
  public_url: string;
  /** Only for a signed-in brand viewer; `null` for everyone else: hide the heart, don't render it empty. */
  is_shortlisted: boolean | null;
  highlights: MediaKitHighlights | null;
  audience: MediaKitAudience | null;
  worked_with: MediaKitWorkedWith | null;
}

/** Contract §8.3 (brand-only). */
export interface BrandSettings {
  show_on_creator_profiles: boolean;
}

export interface MediaKit {
  id: string;
  slug: string;
  /** Absolute; share it with `?src=link` (§17.8). */
  public_url: string;
  is_public: boolean;
  slug_changed_at: string | null;
  can_change_slug_at: string | null;
  created_at: string;
  updated_at: string;
  preview: PublicMediaKit;
}

export interface SlugCheck {
  available: boolean;
  reason: SlugReason | null;
}

export interface MediaKitStats {
  period: StatsPeriod;
  range: { from: string; to: string };
  generated_at: string;
  profile_views: StatMetric & { series: { date: string; value: number }[] };
  unique_brand_views: StatMetric;
  link_opens: StatMetric;
  shares: StatMetric;
  /** Web page visitors who tapped a store / "open in app" button (deduped per visitor). Optional on older APIs. */
  app_clicks?: StatMetric;
  /** `null` until the backend ships the metric: hide the tile. */
  search_impressions: StatMetric | null;
  offers_from_profile: StatMetric | null;
  top_portfolio_items: { id: string; title: string; thumbnail_url: string; clicks: number }[];
  brand_locations: { key: string; label: string; count: number; share_pct: number }[];
}

export interface UpdateMediaKitRequest {
  slug?: string;
  is_public?: boolean;
}

export interface ShareMediaKitRequest {
  channel: ShareChannel;
  /** One per user tap; reuse on retry so the server counts once. */
  idempotencyKey: string;
}

export interface ShareMediaKitResult {
  channel: ShareChannel;
  occurred_at: string;
}

export interface SetKitShortlistedRequest {
  slug: string;
  shortlisted: boolean;
}

export interface TrackMediaKitViewRequest {
  slug: string;
  src: ViewSource;
}

/** Public kit + the slug it really lives at (differs after a slug change). */
export interface PublicMediaKitResult {
  kit: PublicMediaKit;
  canonicalSlug: string | null;
}
