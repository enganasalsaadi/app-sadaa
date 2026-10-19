import type { ParseKeys } from 'i18next';
import type { HueTone } from '@/core/theme';
import type { CampaignDetail } from '../types/campaign';
import type { CampaignMissingKey } from '../types/campaignDraft';
import type { Timestamp } from '../types/deal';
import {
  campaignCountdown,
  campaignIsland,
  type CampaignCountdownUnit,
  type CampaignIsland,
} from './campaignDetail';
import { campaignReadiness } from './campaignList';
import { campaignIslandActions, extendDeadlineWindow, type CampaignIslandAction } from './campaignLifecycle';
import { knownMissingKeys } from './campaignReview';
import { formatCampaignDate } from './campaignSchedule';
import { getCampaignStatusMeta } from './campaignStatus';

// The «now» card of the brand's campaign page: what is happening to the campaign and what, if
// anything, it waits on from the brand. Pure data (copy keys, no JSX) so each status can be tested.

/** A line of copy: an i18n key with its values, or the server's own text for a status the app doesn't know. */
export type CampaignNowCopy = { key: ParseKeys; params?: Record<string, string | number> } | { text: string };

/** The glyph a ring shows when there is no number to draw. */
export type CampaignNowGlyph = 'review' | 'done' | 'ended' | 'people' | 'pause';

export type CampaignNowRing =
  | { kind: 'countdown'; remaining: number; value: number; unit: CampaignCountdownUnit }
  | { kind: 'ratio'; done: number; total: number }
  | { kind: 'count'; value: number }
  | { kind: 'glyph'; glyph: CampaignNowGlyph };

/** Time left until the automatic consequence of ignoring a todo. */
export interface CampaignNowUrgency {
  kind: 'stop' | 'cancel';
  value: number;
  unit: CampaignCountdownUnit;
}

export type CampaignNowTodo = { hot: boolean } & (
  | { kind: 'applicants'; count: number; urgency: CampaignNowUrgency | null }
  | { kind: 'extend' }
  | { kind: 'missing'; missing: CampaignMissingKey }
  | { kind: 'edit' }
  | { kind: 'decision'; action: CampaignIslandAction; urgency: CampaignNowUrgency | null }
);

export interface CampaignNow {
  tone: HueTone;
  ring: CampaignNowRing;
  head: CampaignNowCopy;
  body: CampaignNowCopy | null;
  todos: CampaignNowTodo[];
  /** Nothing is asked of the brand while the campaign moves on its own: the card says so instead of staying silent. */
  calm: boolean;
  /** What follows once the brand has done its part. */
  next: CampaignNowCopy | null;
}

const ISLAND_TONE = {
  suspended: 'warning',
  ghost: 'warning',
  zeroApplicants: 'info',
  seatFreed: 'interactive',
} as const satisfies Record<CampaignIsland['kind'], HueTone>;

const copy = (key: ParseKeys, params?: Record<string, string | number>): CampaignNowCopy => ({ key, params });

const urgency = (kind: CampaignNowUrgency['kind'], dueAt: Timestamp, now: Timestamp): CampaignNowUrgency | null => {
  if (dueAt <= now) return null;
  // Only the number and its unit are shown, so the window the ring would drain over doesn't matter.
  const { value, unit } = campaignCountdown(dueAt, 1, now);
  return { kind, value, unit };
};

const applicantsTodo = (campaign: CampaignDetail, now: Timestamp): CampaignNowTodo | null => {
  const count = campaign.counters.applicationsOpen;
  if (count <= 0) return null;
  const suspendsAt = campaign.timers.ghost?.suspendsAt ?? null;
  return { kind: 'applicants', hot: true, count, urgency: suspendsAt === null ? null : urgency('stop', suspendsAt, now) };
};

const present = <T>(items: readonly (T | null)[]): T[] => items.filter((item): item is T => item !== null);

/** The one thing the island carries — a suspension, an empty deadline, a waiting applicant, a freed seat. */
const fromIsland = (campaign: CampaignDetail, island: CampaignIsland, now: Timestamp): CampaignNow => {
  const dueAt = island.kind === 'seatFreed' ? null : island.dueAt;
  const date = dueAt === null ? null : formatCampaignDate(dueAt);
  const ring: CampaignNowRing =
    island.kind !== 'seatFreed' && dueAt !== null
      ? { kind: 'countdown', ...campaignCountdown(dueAt, island.windowMs, now) }
      : { kind: 'glyph', glyph: island.kind === 'seatFreed' ? 'people' : 'pause' };
  const ringCountdown = ring.kind === 'countdown' ? ring : null;
  const ends = ringCountdown ? { kind: 'cancel' as const, value: ringCountdown.value, unit: ringCountdown.unit } : null;

  const decisions = campaignIslandActions(island, campaign).map(
    (action, index): CampaignNowTodo => ({
      kind: 'decision',
      action,
      hot: index === 0 && action !== 'cancel',
      urgency: index === 0 ? ends : null,
    }),
  );

  const text = ((): { head: CampaignNowCopy; body: CampaignNowCopy } => {
    switch (island.kind) {
      case 'suspended':
        return {
          head: copy('marketplace.campaign.detail.island.suspended.title'),
          body:
            date === null
              ? copy('marketplace.campaign.detail.island.suspended.bodyNoDate')
              : copy('marketplace.campaign.detail.island.suspended.body', { date }),
        };
      case 'zeroApplicants':
        return {
          head: copy('marketplace.campaign.detail.island.zeroApplicants.title'),
          body: copy('marketplace.campaign.detail.island.zeroApplicants.body', { date: date ?? '' }),
        };
      case 'ghost':
        return {
          head: copy('marketplace.campaign.detail.island.ghost.title'),
          body: copy('marketplace.campaign.detail.island.ghost.body'),
        };
      case 'seatFreed':
        return {
          head: copy('marketplace.campaign.detail.island.seatFreed.title', { count: island.freeSeats }),
          body: copy('marketplace.campaign.detail.island.seatFreed.body'),
        };
      default: {
        const _exhaustive: never = island;
        return _exhaustive;
      }
    }
  })();

  const todos = present([...decisions, applicantsTodo(campaign, now)]);
  return {
    tone: ISLAND_TONE[island.kind],
    ring,
    ...text,
    todos,
    calm: todos.length === 0,
    next: null,
  };
};

const NO_TODOS: CampaignNowTodo[] = [];

/** A status with nothing left to do: the copy says where it stands. */
const rest = (
  tone: HueTone,
  ring: CampaignNowRing,
  key: 'completed' | 'cancelled' | 'rejected' | 'removed' | 'review',
): CampaignNow => ({
  tone,
  ring,
  head: copy(`marketplace.campaign.detail.now.${key}.head`),
  body: copy(`marketplace.campaign.detail.now.${key}.body`),
  todos: NO_TODOS,
  calm: key === 'review',
  next: key === 'review' ? copy('marketplace.campaign.detail.now.review.next') : null,
});

/** A draft or a campaign sent back: the ring counts what is ready, each missing piece is a todo. */
const fromDraft = (campaign: CampaignDetail, sentBack: boolean): CampaignNow => {
  const { done, total } = campaignReadiness(campaign);
  const missing = knownMissingKeys(campaign.missing);
  const key = sentBack ? 'changes' : 'draft';
  const todos: CampaignNowTodo[] =
    missing.length > 0
      ? missing.map(entry => ({ kind: 'missing', hot: true, missing: entry }))
      : sentBack
        ? [{ kind: 'edit', hot: true }]
        : NO_TODOS;
  return {
    tone: sentBack ? 'warning' : 'neutral',
    ring: { kind: 'ratio', done, total },
    head: copy(`marketplace.campaign.detail.now.${key}.head`),
    body: copy(`marketplace.campaign.detail.now.${key}.body`),
    todos,
    calm: false,
    next: copy(`marketplace.campaign.detail.now.${key}.next`),
  };
};

const fromOpen = (campaign: CampaignDetail, now: Timestamp): CampaignNow => {
  const { applyDeadlineAt, publishedAt, createdAt, counters } = campaign;
  const waiting = counters.applicationsOpen > 0;
  const ring: CampaignNowRing =
    applyDeadlineAt !== null && applyDeadlineAt > now
      ? {
          kind: 'countdown',
          ...campaignCountdown(applyDeadlineAt, Math.max(1, applyDeadlineAt - (publishedAt ?? createdAt)), now),
        }
      : { kind: 'glyph', glyph: 'people' };
  const todos = present([
    applicantsTodo(campaign, now),
    extendDeadlineWindow(campaign, now) === null ? null : ({ kind: 'extend', hot: false } as const),
  ]);
  return {
    tone: 'interactive',
    ring,
    head: copy('marketplace.campaign.detail.now.open.head'),
    body: copy(
      waiting ? 'marketplace.campaign.detail.now.open.bodyWaiting' : 'marketplace.campaign.detail.now.open.bodyQuiet',
    ),
    todos,
    calm: todos.length === 0,
    next: copy('marketplace.campaign.detail.now.open.next'),
  };
};

/** Seats taken and the work running (or recruiting closed early): the ring counts the creators. */
const fromRunning = (campaign: CampaignDetail, key: 'filled' | 'closed'): CampaignNow => ({
  tone: getCampaignStatusMeta(campaign.status.key).tone,
  ring: { kind: 'count', value: campaign.counters.seatsOccupied },
  head: copy(`marketplace.campaign.detail.now.${key}.head`),
  body: copy(`marketplace.campaign.detail.now.${key}.body`),
  todos: NO_TODOS,
  calm: true,
  next: copy(`marketplace.campaign.detail.now.${key}.next`),
});

/** What the page's «now» card says for this campaign at `now`. */
export const campaignNow = (campaign: CampaignDetail, now: Timestamp): CampaignNow => {
  const island = campaignIsland(campaign, now);
  if (island) return fromIsland(campaign, island, now);
  const status = campaign.status.key;
  switch (status) {
    case 'draft':
      return fromDraft(campaign, false);
    case 'changes_requested':
      return fromDraft(campaign, true);
    case 'pending_review':
      return rest('info', { kind: 'glyph', glyph: 'review' }, 'review');
    // The island always covers a suspended campaign; it shares the case only to keep the switch exhaustive.
    case 'open':
    case 'suspended':
      return fromOpen(campaign, now);
    case 'filled':
      return fromRunning(campaign, 'filled');
    case 'closed':
      return fromRunning(campaign, 'closed');
    case 'completed':
      return rest('success', { kind: 'glyph', glyph: 'done' }, 'completed');
    case 'cancelled':
      return rest('neutral', { kind: 'glyph', glyph: 'ended' }, 'cancelled');
    case 'rejected':
      return rest('danger', { kind: 'glyph', glyph: 'ended' }, 'rejected');
    case 'removed':
      return rest('danger', { kind: 'glyph', glyph: 'ended' }, 'removed');
    case null:
      return {
        tone: 'neutral',
        ring: { kind: 'glyph', glyph: 'people' },
        head: { text: campaign.status.label },
        body: null,
        todos: NO_TODOS,
        calm: false,
        next: null,
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};
