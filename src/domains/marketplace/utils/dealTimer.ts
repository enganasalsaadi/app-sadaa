import type { TFunction } from 'i18next';
import { DEAL_EXTENSION_ANSWER_HOURS, DEFAULT_DEAL_WINDOWS } from '../constants/dealOffer';
import { DEAL_STATUS_META } from '../constants/dealStatus';
import type { Deal } from '../types';
import { formatNumber } from '@/core/i18n';
import { toDurationParts } from './offerDuration';

const MS_PER_HOUR = 3_600_000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
/** Under this much time left a running window turns amber (rule 08: warning = time is short). */
export const DEAL_LATE_SECONDS = 12 * SECONDS_PER_HOUR;

/**
 * The deal's running clock. `paused`: an open deal whose timers the server froze (shipping
 * issue, dispute: `due_at` is `null`). `windowHours`: the full length of the current window,
 * only to draw how much of it has gone — never to compute a deadline (rule 06).
 */
export interface DealTimer {
  dueAt: number | null;
  paused: boolean;
  windowHours: number | null;
}

type TimerInput = Pick<
  Deal,
  | 'status'
  | 'stage'
  | 'dueAt'
  | 'shipping'
  | 'deliveryHours'
  | 'extendedDeliveryHours'
  | 'onHold'
>;

const FREEZING = new Set(['shipping_issue', 'disputed']);

const windowOf = (deal: TimerInput): number | null => {
  const shipped = (deal.shipping?.shipments.length ?? 0) > 0;
  switch (deal.status.key) {
    case 'pending_influencer':
      return DEFAULT_DEAL_WINDOWS.influencerResponseHours;
    case 'negotiating_deadline':
      return DEAL_EXTENSION_ANSWER_HOURS;
    case 'awaiting_payment':
      return DEFAULT_DEAL_WINDOWS.paymentTopUpHours;
    case 'product_shipping':
      return shipped ? null : DEFAULT_DEAL_WINDOWS.brandShipHours;
    case 'in_progress':
      switch (deal.stage?.key ?? null) {
        case 'draft_submitted':
        case 'verifying_live':
          return DEFAULT_DEAL_WINDOWS.brandReviewHours;
        case 'approved_to_publish':
          return DEFAULT_DEAL_WINDOWS.publishWindowHours;
        case 'pending':
        case 'revision_requested':
          return deal.extendedDeliveryHours ?? deal.deliveryHours;
        default:
          return null;
      }
    default:
      return null;
  }
};

export const dealTimer = (deal: TimerInput): DealTimer => {
  const status = deal.status.key;
  const open = status !== null && DEAL_STATUS_META[status].outcome === 'open';
  if (!open) return { dueAt: null, paused: false, windowHours: null };
  // Account hold: `due_at` keeps its old value but nothing counts down.
  if (deal.onHold) return { dueAt: null, paused: true, windowHours: null };
  return {
    dueAt: deal.dueAt,
    paused: deal.dueAt === null && FREEZING.has(status),
    windowHours: deal.dueAt === null ? null : windowOf(deal),
  };
};

/** Share of the window already gone (0–1), for the fill behind the status line; `null` = unknown. */
export const timerElapsedShare = (
  timer: DealTimer,
  now: number,
): number | null => {
  if (
    timer.dueAt === null ||
    timer.windowHours === null ||
    timer.windowHours <= 0
  )
    return null;
  const left = (timer.dueAt - now) / (timer.windowHours * MS_PER_HOUR);
  return Math.min(1, Math.max(0, 1 - left));
};

/** Seconds left, never negative. */
export const timerSecondsLeft = (dueAt: number, now: number): number =>
  Math.max(0, Math.floor((dueAt - now) / 1000));

export interface RemainingParts {
  unit: 'minutes' | 'hours' | 'days';
  count: number;
}

/** Up to two days in hours, longer in days, the last hour in minutes. */
export const remainingParts = (seconds: number): RemainingParts =>
  seconds >= SECONDS_PER_HOUR
    ? toDurationParts(Math.floor(seconds / SECONDS_PER_HOUR))
    : {
        unit: 'minutes',
        count: Math.max(1, Math.ceil(seconds / SECONDS_PER_MINUTE)),
      };

/** What is left, as people say it: «41 ساعة», «3 أيام», «25 دقيقة». */
export const formatRemaining = (t: TFunction, seconds: number): string => {
  const { unit, count } = remainingParts(seconds);
  switch (unit) {
    case 'minutes':
      return t('marketplace.deals.timer.minutes', { count });
    case 'hours':
      return t('marketplace.offer.units.hours', { count });
    case 'days':
      return t('marketplace.offer.units.days', { count });
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
};

/** The deal's clock as screens draw it, at `now`. */
export type DealTimeView =
  | { kind: 'left'; seconds: number; share: number | null; late: boolean }
  | { kind: 'paused' }
  /** Account hold: paused while Sada reviews an account. */
  | { kind: 'held' }
  | { kind: 'closed'; at: number | null }
  | { kind: 'none' };

type TimeViewInput = TimerInput & Pick<Deal, 'updatedAt'>;

export const dealTimeView = (
  deal: TimeViewInput,
  now: number,
): DealTimeView => {
  const status = deal.status.key;
  if (status !== null && DEAL_STATUS_META[status].outcome !== 'open')
    return { kind: 'closed', at: deal.updatedAt };
  if (deal.onHold) return { kind: 'held' };
  const timer = dealTimer(deal);
  if (timer.paused) return { kind: 'paused' };
  if (timer.dueAt === null) return { kind: 'none' };
  const seconds = timerSecondsLeft(timer.dueAt, now);
  return {
    kind: 'left',
    seconds,
    share: timerElapsedShare(timer, now),
    late: seconds < DEAL_LATE_SECONDS,
  };
};

const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

/** A running deadline as a clock face, hours uncapped: «31:20:05». */
export const formatClock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return `${pad(hours)}:${pad(minutes)}:${pad(total % SECONDS_PER_MINUTE)}`;
};
