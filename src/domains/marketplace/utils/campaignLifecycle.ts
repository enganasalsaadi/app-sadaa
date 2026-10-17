import { CAMPAIGN_MONEY_LIMITS, CAMPAIGN_SCHEDULE } from '../constants/campaignMoney';
import type { CampaignDetail } from '../types/campaign';
import type { Timestamp } from '../types/deal';
import { damascusDayKey, damascusMoment } from './campaignSchedule';

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const END_OF_DAY = 24 * 60 - 1;

/** What the campaign's «⋯» can offer (contract §3.3). The server re-checks every one. */
export type CampaignMenuAction =
  | 'resume'
  | 'addSeats'
  | 'extendDeadline'
  | 'edit'
  | 'duplicate'
  | 'close'
  | 'cancel'
  | 'delete';

export interface CampaignMenuRow {
  action: CampaignMenuAction;
  /** Shown with its reason instead of hidden (seats at the cap, the 30-day limit reached). */
  disabled: boolean;
}

const row = (action: CampaignMenuAction, disabled = false): CampaignMenuRow => ({ action, disabled });

/** The days a new application deadline may fall on, and the latest moment it may be. */
export interface CampaignDeadlineWindow {
  minDay: string;
  maxDay: string;
  /** Applications close at the end of the picked day, held under this. */
  capAt: Timestamp;
  /** The picked moment must be later than this (the current deadline, or now). */
  after: Timestamp;
}

const deadlineWindow = (after: Timestamp, capAt: Timestamp): CampaignDeadlineWindow | null => {
  // A minute past `after`: a deadline at the end of its day leaves that day with nothing later.
  const minDay = damascusDayKey(after + MINUTE_MS);
  const maxDay = damascusDayKey(capAt);
  return capAt > after && minDay <= maxDay ? { minDay, maxDay, capAt, after } : null;
};

/** Never past the drop's latest legal deadline (its min gap). */
const dropCap = (campaign: Pick<CampaignDetail, 'drop'>, cap: Timestamp): Timestamp =>
  campaign.drop ? Math.min(cap, campaign.drop.latestApplyDeadlineAt) : cap;

/**
 * `/deadline`: later than the current one, in the future, at most 30 days after publishing, and
 * still clear of the drop gap. `null` when nothing later is legal.
 */
export const extendDeadlineWindow = (
  campaign: Pick<CampaignDetail, 'applyDeadlineAt' | 'publishedAt' | 'drop'>,
  now: Timestamp,
): CampaignDeadlineWindow | null => {
  const base = campaign.publishedAt ?? now;
  const cap = dropCap(
    campaign,
    base + CAMPAIGN_SCHEDULE.deadlineMaxDays * DAY_MS - CAMPAIGN_SCHEDULE.deadlineEdgeMarginMs,
  );
  return deadlineWindow(Math.max(now, campaign.applyDeadlineAt ?? now), cap);
};

/** A fresh deadline (adding seats after the old one passed): from now, within 30 days and the drop gap. */
export const freshDeadlineWindow = (
  campaign: Pick<CampaignDetail, 'drop'>,
  now: Timestamp,
): CampaignDeadlineWindow | null =>
  deadlineWindow(
    now,
    dropCap(campaign, now + CAMPAIGN_SCHEDULE.deadlineMaxDays * DAY_MS - CAMPAIGN_SCHEDULE.deadlineEdgeMarginMs),
  );

/** The end of the picked Damascus day, held under the window's cap; `null` when not later than allowed. */
export const deadlineInWindow = (day: string, range: CampaignDeadlineWindow): Timestamp | null => {
  const endOfDay = damascusMoment(day, END_OF_DAY);
  if (endOfDay === null) return null;
  const at = Math.min(endOfDay, range.capAt);
  return at > range.after ? at : null;
};

/** Seats that can still be added (the total stays ≤ 20). */
export const seatsAddable = ({ seatsTotal }: Pick<CampaignDetail, 'seatsTotal'>): number =>
  Math.max(0, CAMPAIGN_MONEY_LIMITS.seatsMax - seatsTotal);

/**
 * The rows of the campaign's «⋯», by status (contract §2.1, §3.3). Ending is one row: «close
 * recruiting» once a seat is taken, «cancel» while none is (each refuses the other case).
 * Seats on `open/suspended/filled`; the deadline on `open/suspended` only.
 */
export const campaignMenuRows = (campaign: CampaignDetail, now: Timestamp): CampaignMenuRow[] => {
  const status = campaign.status.key;
  const end = campaign.counters.seatsOccupied > 0 ? row('close') : row('cancel');
  const seats = row('addSeats', seatsAddable(campaign) === 0);
  const deadline = row('extendDeadline', extendDeadlineWindow(campaign, now) === null);
  switch (status) {
    case 'draft':
      return [row('resume'), row('duplicate'), row('delete')];
    case 'changes_requested':
      return [row('resume'), row('duplicate'), row('cancel')];
    case 'open':
    case 'suspended':
      return [seats, deadline, row('edit'), row('duplicate'), end];
    case 'filled':
      // Every seat is taken, so neither ending applies: the deals run on to «completed».
      return [seats, row('edit'), row('duplicate')];
    case 'pending_review':
    case 'closed':
    case 'completed':
    case 'cancelled':
    case 'rejected':
    case 'removed':
    case null:
      return [row('duplicate')];
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};
