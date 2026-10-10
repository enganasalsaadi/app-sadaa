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
  bio: null;
  top_portfolio_items: [];
  offers_from_profile: null;
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

export interface TrackMediaKitViewRequest {
  slug: string;
  src: ViewSource;
}

/** Public kit + the slug it really lives at (differs after a slug change). */
export interface PublicMediaKitResult {
  kit: PublicMediaKit;
  canonicalSlug: string | null;
}
