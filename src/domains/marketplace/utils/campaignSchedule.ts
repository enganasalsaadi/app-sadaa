import { formatDate } from '@/core/i18n';
import { CAMPAIGN_DELIVERY_DAY_PRESETS, CAMPAIGN_SCHEDULE } from '../constants/campaignMoney';
import type { CampaignDetail } from '../types/campaign';
import type { CampaignDraftValues } from '../types/campaignDraft';
import type { DealShippingMode, Timestamp } from '../types/deal';

// Campaign dates are picked and read in Damascus time (contract §1.3), whatever the phone's zone.

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const { utcOffsetMs } = CAMPAIGN_SCHEDULE;

/** How the content goes out: each creator within a number of days, or everyone at one drop moment. */
export type CampaignScheduleMode = 'delivery' | 'drop';

/** A moment whose UTC fields read Damascus wall time: format it with `timeZone: 'UTC'`. */
export const damascusWallClock = (at: Timestamp): Date => new Date(at + utcOffsetMs);

// The shifted clock is read in UTC, so the phone's own zone never moves a date.
const DAY_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', timeZone: 'UTC' };
const DATE_FORMAT: Intl.DateTimeFormatOptions = { ...DAY_FORMAT, year: 'numeric' };
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' };
const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = { ...DATE_FORMAT, ...TIME_FORMAT };

/** «28 تشرين الأول 2026» in Damascus. */
export const formatCampaignDate = (at: Timestamp): string => formatDate(damascusWallClock(at), DATE_FORMAT);
/** «28 تشرين الأول» in Damascus (timeline rows, where the year is plain). */
export const formatCampaignDay = (at: Timestamp): string => formatDate(damascusWallClock(at), DAY_FORMAT);
/** «8:00 م» in Damascus. */
export const formatCampaignTime = (at: Timestamp): string => formatDate(damascusWallClock(at), TIME_FORMAT);
/** Date and time in Damascus (a drop). */
export const formatCampaignDateTime = (at: Timestamp): string => formatDate(damascusWallClock(at), DATE_TIME_FORMAT);

/** `YYYY-MM-DD` of a moment in Damascus (the calendar's day key). */
export const damascusDayKey = (at: Timestamp): string => damascusWallClock(at).toISOString().slice(0, 10);

/** Minutes past midnight in Damascus. */
export const damascusMinuteOfDay = (at: Timestamp): number => {
  const clock = damascusWallClock(at);
  return clock.getUTCHours() * 60 + clock.getUTCMinutes();
};

/** The moment a Damascus day + minute of that day is; `null` for a malformed day key. */
export const damascusMoment = (day: string, minuteOfDay: number): Timestamp | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, minuteOfDay) - utcOffsetMs;
};

/** Whole Damascus days from `now` to `at` (0 = today). */
export const damascusDaysUntil = (at: Timestamp, now: Timestamp): number =>
  Math.floor((at + utcOffsetMs) / DAY_MS) - Math.floor((now + utcOffsetMs) / DAY_MS);

const latestDeadline = (now: Timestamp): Timestamp =>
  now + CAMPAIGN_SCHEDULE.deadlineMaxDays * DAY_MS - CAMPAIGN_SCHEDULE.deadlineEdgeMarginMs;

/** The days the application deadline may fall on: today up to 30 days ahead. */
export const deadlineDayRange = (now: Timestamp): { min: string; max: string } => ({
  min: damascusDayKey(now),
  max: damascusDayKey(latestDeadline(now)),
});

const END_OF_DAY = 24 * 60 - 1;

/**
 * Applications close at the end of the chosen day, held under the 30-day cap. `null` when that
 * day is already over.
 */
export const deadlineFromDay = (day: string, now: Timestamp): Timestamp | null => {
  const endOfDay = damascusMoment(day, END_OF_DAY);
  if (endOfDay === null || endOfDay <= now) return null;
  return Math.min(endOfDay, latestDeadline(now));
};

/** Least gap between the deadline and the drop: products need shipping time first. */
export const dropGapHours = (shippingMode: DealShippingMode): number =>
  shippingMode === 'none' ? CAMPAIGN_SCHEDULE.dropGapDigitalHours : CAMPAIGN_SCHEDULE.dropGapShippedHours;

/** Earliest legal drop: the gap after the deadline (after now while no deadline is set). */
export const earliestDropAt = (
  deadline: Timestamp | null,
  shippingMode: DealShippingMode,
  now: Timestamp,
): Timestamp => Math.max(deadline ?? now, now) + dropGapHours(shippingMode) * HOUR_MS;

export const isDropTooEarly = (
  values: Pick<CampaignDraftValues, 'dropAt' | 'applyDeadlineAt' | 'shippingMode'>,
  now: Timestamp,
): boolean =>
  values.dropAt !== null && values.dropAt < earliestDropAt(values.applyDeadlineAt, values.shippingMode, now);

export interface DropTimeOption {
  /** Minutes past midnight (Damascus); the option's id. */
  minute: number;
  at: Timestamp;
  /** Too close to the deadline on this day. */
  enabled: boolean;
}

/**
 * The times a drop can take on `day`: the offered hours, plus the saved drop's own time when it is
 * another one (a duplicated or older draft), each marked usable or too early.
 */
export const dropTimeOptions = (day: string, earliest: Timestamp, current: Timestamp | null): DropTimeOption[] => {
  const minutes = new Set<number>(CAMPAIGN_SCHEDULE.dropHours.map(hour => hour * 60));
  if (current !== null) minutes.add(damascusMinuteOfDay(current));
  return [...minutes]
    .sort((a, b) => a - b)
    .flatMap(minute => {
      const at = damascusMoment(day, minute);
      return at === null ? [] : [{ minute, at, enabled: at >= earliest }];
    });
};

/**
 * The time preselected in the drop sheet for `day`: the one already chosen, else the default
 * evening hour, else the first usable one; `null` when the whole day is too early.
 */
export const preferredDropMinute = (options: readonly DropTimeOption[], chosen: number | null): number | null => {
  const usable = (minute: number | null) => options.some(option => option.minute === minute && option.enabled);
  if (chosen !== null && usable(chosen)) return chosen;
  const fallback = CAMPAIGN_SCHEDULE.dropHourDefault * 60;
  if (usable(fallback)) return fallback;
  return options.find(option => option.enabled)?.minute ?? null;
};

/** What moving between the two ways clears: only one of the pair is ever kept (contract §3.2). */
export const scheduleModePatch = (mode: CampaignScheduleMode): Partial<CampaignDraftValues> =>
  mode === 'drop' ? { deliveryDays: null } : { dropAt: null };

/** The one-tap delivery windows, with the draft's own value added when it is not one of them. */
export const deliveryDayChoices = (current: number | null): number[] => {
  const days = new Set<number>(CAMPAIGN_DELIVERY_DAY_PRESETS);
  if (current !== null) days.add(current);
  return [...days].sort((a, b) => a - b);
};

/** The drop's derived dates (contract §3.2), from the server's answer for the drop on screen. */
export interface CampaignDropTimeline {
  draftDueAt: Timestamp;
  /** Hours between the drafts' due time and the drop. */
  draftLeadHours: number;
  publishOpensAt: Timestamp;
  /** Minutes between the publish link opening and the drop. */
  publishLeadMinutes: number;
  latestApplyDeadlineAt: Timestamp;
}

/**
 * The derived dates once the server has saved this exact drop; `null` while the drop on screen
 * is not the saved one (the old dates would mislead).
 */
export const dropTimelineOf = (
  campaign: Pick<CampaignDetail, 'dropAt' | 'drop'> | undefined,
  dropAt: Timestamp | null,
): CampaignDropTimeline | null => {
  if (!campaign?.drop || dropAt === null || campaign.dropAt !== dropAt) return null;
  const { draftDueAt, publishOpensAt, latestApplyDeadlineAt } = campaign.drop;
  return {
    draftDueAt,
    draftLeadHours: Math.round((dropAt - draftDueAt) / HOUR_MS),
    publishOpensAt,
    publishLeadMinutes: Math.round((dropAt - publishOpensAt) / MINUTE_MS),
    latestApplyDeadlineAt,
  };
};
