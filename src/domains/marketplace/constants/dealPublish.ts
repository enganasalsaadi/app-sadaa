import type { ParseKeys } from 'i18next';

/** Server `deals.publication` caps (B7). */
export const DEAL_PUBLISH_LIMITS = {
  url: 2048,
  fixNote: 2000,
  /** Fix requests per deliverable; the counter itself comes from `fix_requests_left`. */
  fixes: 2,
} as const;

/** Platforms the server reads a live link for (`LiveUrlInspector`). */
export const DEAL_LIVE_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook', 'telegram'] as const;
export type DealLivePlatform = (typeof DEAL_LIVE_PLATFORMS)[number];

/** Registrable domains per platform, as the server checks them; subdomains (www., m.) pass. */
export const DEAL_LIVE_HOSTS = {
  instagram: ['instagram.com', 'instagr.am'],
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  facebook: ['facebook.com', 'fb.com', 'fb.watch'],
  telegram: ['t.me', 'telegram.me'],
} as const satisfies Record<DealLivePlatform, readonly string[]>;

export const DEAL_LIVE_PLATFORM_LABEL = {
  instagram: 'marketplace.deals.publish.platform.instagram',
  tiktok: 'marketplace.deals.publish.platform.tiktok',
  youtube: 'marketplace.deals.publish.platform.youtube',
  facebook: 'marketplace.deals.publish.platform.facebook',
  telegram: 'marketplace.deals.publish.platform.telegram',
} as const satisfies Record<DealLivePlatform, ParseKeys>;

/**
 * Why a live link was refused: `422 deal_live_url_invalid` `meta.reason`, plus the app's own
 * pre-check (same codes) and `409 deal_live_url_taken`.
 */
export const DEAL_LIVE_URL_REASONS = ['invalid', 'platform_mismatch', 'handle_mismatch', 'taken'] as const;
export type DealLiveUrlReason = (typeof DEAL_LIVE_URL_REASONS)[number];

export const DEAL_LIVE_URL_REASON_COPY = {
  invalid: {
    title: 'marketplace.deals.publish.reason.invalid.title',
    body: 'marketplace.deals.publish.reason.invalid.body',
  },
  platform_mismatch: {
    title: 'marketplace.deals.publish.reason.platformMismatch.title',
    body: 'marketplace.deals.publish.reason.platformMismatch.body',
  },
  handle_mismatch: {
    title: 'marketplace.deals.publish.reason.handleMismatch.title',
    body: 'marketplace.deals.publish.reason.handleMismatch.body',
  },
  taken: {
    title: 'marketplace.deals.publish.reason.taken.title',
    body: 'marketplace.deals.publish.reason.taken.body',
  },
} as const satisfies Record<DealLiveUrlReason, { title: ParseKeys; body: ParseKeys }>;

/** Quick starts for a fix request; tapping one fills the note, which stays editable. */
export const DEAL_FIX_CHIPS = [
  'marketplace.deals.publish.fix.chips.broken',
  'marketplace.deals.publish.fix.chips.removed',
  'marketplace.deals.publish.fix.chips.otherAccount',
  'marketplace.deals.publish.fix.chips.brief',
] as const satisfies readonly ParseKeys[];
