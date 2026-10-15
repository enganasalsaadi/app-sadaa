import type { AppApiError } from '@/core/api';
import {
  DEAL_LIVE_HOSTS,
  DEAL_LIVE_PLATFORMS,
  DEAL_LIVE_URL_REASONS,
  DEAL_PUBLISH_LIMITS,
  type DealLivePlatform,
  type DealLiveUrlReason,
} from '../constants/dealPublish';
import type { DealItem, DealPublication, Timestamp } from '../types';

// http(s) only, no userinfo or port tricks: `https://instagram.com@evil.example` must not read as
// Instagram. RN's URL polyfill has no reliable `hostname`, so the parts are parsed here.
const LIVE_URL = /^https?:\/\/([a-z0-9.-]+)(?::\d{1,5})?([/?#]\S*)?$/i;
const DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

export const isLivePlatform = (value: string | null): value is DealLivePlatform =>
  value !== null && (DEAL_LIVE_PLATFORMS as readonly string[]).includes(value);

/** Which platform a host belongs to (`www.` / `m.` / `vm.` subdomains included). */
export const livePlatformOf = (host: string): DealLivePlatform | null =>
  DEAL_LIVE_PLATFORMS.find(platform =>
    (DEAL_LIVE_HOSTS[platform] as readonly string[]).some(
      domain => host === domain || host.endsWith(`.${domain}`),
    ),
  ) ?? null;

export interface LiveUrl {
  url: string;
  /** Lower-case, without `www.`: what the address bar shows muted. */
  host: string;
  /** Everything after the host (`/reel/C9x…`). */
  path: string;
  platform: DealLivePlatform | null;
}

/** A pasted link taken apart; `null` when it is not an http(s) link the server could accept. */
export const parseLiveUrl = (raw: string): LiveUrl | null => {
  const url = raw.trim();
  if (!url || url.length > DEAL_PUBLISH_LIMITS.url) return null;
  const match = LIVE_URL.exec(url);
  const host = match?.[1]?.toLowerCase() ?? '';
  if (!match || !DOMAIN.test(host)) return null;
  return {
    url,
    host: host.replace(/^www\./, ''),
    path: match[2] ?? '',
    platform: livePlatformOf(host),
  };
};

/**
 * The app's own check before sending, with the server's reason codes. `null` = looks right; the
 * server still reads the account and decides. Items on a platform the app doesn't know only need
 * a valid link.
 */
export const checkLiveUrl = (
  raw: string,
  itemPlatform: string | null,
): Extract<DealLiveUrlReason, 'invalid' | 'platform_mismatch'> | null => {
  const parsed = parseLiveUrl(raw);
  if (!parsed) return 'invalid';
  return isLivePlatform(itemPlatform) && parsed.platform !== itemPlatform ? 'platform_mismatch' : null;
};

/** Rule 07: a stored live link opens only when it is on an allow-listed platform host. */
export const safeLiveUrl = (url: string | null): string | null => {
  const parsed = url ? parseLiveUrl(url) : null;
  return parsed?.platform ? parsed.url : null;
};

export const isLiveUrlReason = (value: string | null | undefined): value is DealLiveUrlReason =>
  typeof value === 'string' && (DEAL_LIVE_URL_REASONS as readonly string[]).includes(value);

/** Why the server refused a link (`422 deal_live_url_invalid` reason, `409 deal_live_url_taken`). */
export const readLiveUrlReason = ({ code, reason }: Pick<AppApiError, 'code' | 'reason'>): DealLiveUrlReason | null => {
  if (code === 'deal_live_url_taken') return 'taken';
  if (code !== 'deal_live_url_invalid') return null;
  return reason !== 'taken' && isLiveUrlReason(reason) ? reason : 'invalid';
};

/** Drafts until the brand approves; from then on the item lives on its publish screen. */
export type DealItemStage = 'draft' | 'publish';

export const dealItemStage = (item: Pick<DealItem, 'status'>): DealItemStage => {
  switch (item.status.key) {
    case 'approved_to_publish':
    case 'verifying_live':
    case 'verified':
      return 'publish';
    case 'pending':
    case 'draft_submitted':
    case 'revision_requested':
    case null:
      return 'draft';
    default: {
      const _exhaustive: never = item.status.key;
      return _exhaustive;
    }
  }
};

/** The submission the creator answers now: the last one, once the brand asked for a fix on it. */
export const dealFixAsk = (publications: readonly DealPublication[]): DealPublication | null => {
  const latest = publications[0];
  return latest?.review?.decision.key === 'fix_requested' ? latest : null;
};

export interface DealFixCount {
  used: number;
  remaining: number;
  allowed: number;
}

/** Fix requests so far and left (left from the server; used from the record). */
export const dealFixCount = (
  item: Pick<DealItem, 'fixRequestsLeft'>,
  publications: readonly DealPublication[],
): DealFixCount => {
  const used = publications.filter(entry => entry.review?.decision.key === 'fix_requested').length;
  const remaining = Math.max(0, item.fixRequestsLeft);
  return { used, remaining, allowed: used + remaining };
};

/** Share of a window already gone (0–1), for the fuse; display only. */
export const windowShare = (startedAt: Timestamp, dueAt: Timestamp | null, now: number): number => {
  if (dueAt === null || dueAt <= startedAt) return 0;
  return Math.min(1, Math.max(0, (now - startedAt) / (dueAt - startedAt)));
};

/** Confirming this one completes the deal: every other deliverable is already verified. */
export const isLastToVerify = (deal: { items: readonly Pick<DealItem, 'id' | 'status'>[] }, itemId: string): boolean =>
  deal.items.every(item => item.id === itemId || item.status.key === 'verified');

/** `POST …/publish` body; an item with no platform may go without a link. */
export const toPublishBody = (url: string, proofFileIds: readonly string[]) => {
  const trimmed = url.trim();
  return { ...(trimmed ? { url: trimmed } : {}), proof_file_ids: [...proofFileIds] };
};
