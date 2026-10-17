import type { AppApiError } from '@/core/api';
import type { CampaignAnnouncement } from '../types/campaignAnnouncement';
import type { Timestamp } from '../types/deal';

/** Server limits (contract §3.9), mirrored for validation and the daily dots. */
export const CAMPAIGN_ANNOUNCEMENT_LIMITS = {
  bodyMin: 3,
  bodyMax: 1000,
  linkMax: 500,
  /** Announcements per campaign inside the rolling window. */
  perWindow: 3,
  windowMs: 24 * 60 * 60 * 1000,
} as const;

export interface AnnouncementQuota {
  /** Sent inside the rolling 24 hours (or the cap, while the server says it is reached). */
  used: number;
  limit: number;
  /** When the next one may go, while the cap is reached; `null` while one is free. */
  unlocksAt: Timestamp | null;
}

/**
 * Today's quota from the real history (`sent_at` inside the last 24 hours), never a local counter.
 * Rolling window: with `n` sent inside it, a slot frees when the `n - limit + 1`-th oldest turns 24
 * hours old. `serverLockUntil` is the reset a `429` named (`meta.next_available_at`); it wins while
 * it is still ahead, since the server's view (another device, a stale page) is the one that counts.
 */
export const announcementQuota = (
  history: readonly Pick<CampaignAnnouncement, 'sentAt'>[],
  serverLockUntil: Timestamp | null,
  now: number,
): AnnouncementQuota => {
  const { perWindow, windowMs } = CAMPAIGN_ANNOUNCEMENT_LIMITS;
  const inside = history
    .map(entry => entry.sentAt)
    .filter(sentAt => sentAt > now - windowMs)
    .sort((a, b) => a - b);
  const frees = inside.length >= perWindow ? (inside[inside.length - perWindow] ?? 0) + windowMs : null;
  const server = serverLockUntil !== null && serverLockUntil > now ? serverLockUntil : null;
  const unlocksAt = frees !== null && server !== null ? Math.max(frees, server) : (frees ?? server);
  return {
    used: unlocksAt !== null ? perWindow : inside.length,
    limit: perWindow,
    unlocksAt,
  };
};

/**
 * When a `429 campaign_announcement_limit` says the next broadcast may go: the named instant
 * (`meta.next_available_at`), else `retry_after` seconds from now, else unknown.
 */
export const announcementLockFrom = (
  error: Pick<AppApiError, 'availableAt' | 'retryAfter'>,
  now: number,
): Timestamp | null => {
  const named = error.availableAt === null ? Number.NaN : Date.parse(error.availableAt);
  if (Number.isFinite(named)) return named;
  return error.retryAfter !== null ? now + error.retryAfter * 1000 : null;
};
