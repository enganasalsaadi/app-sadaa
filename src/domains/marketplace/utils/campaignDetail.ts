import {
  CAMPAIGN_HISTORY_REASON,
  CAMPAIGN_SUSPENSION_WINDOW_MS,
  CAMPAIGN_ZERO_APPLICANTS_WINDOW_MS,
  type CampaignHistoryReason,
  type CampaignHistoryReasonKey,
} from '../constants/campaignDetail';
import type { CampaignDetail, CampaignHistoryRow } from '../types/campaign';
import type { Timestamp } from '../types/deal';
import { getCampaignStatusMeta } from './campaignStatus';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** The one thing a live campaign waits on, shown as the page's «island»; PC2.4 gives each its actions. */
export type CampaignIsland =
  | { kind: 'suspended' | 'zeroApplicants' | 'ghost'; dueAt: Timestamp | null; windowMs: number }
  | { kind: 'seatFreed'; freeSeats: number };

/**
 * Most urgent first: a suspension cancels itself, an empty deadline does too, a waiting applicant
 * suspends the campaign (shown once the 48h warning has fired), a freed seat blocks recruiting.
 */
export const campaignIsland = (campaign: CampaignDetail, now: number): CampaignIsland | null => {
  const { tab, final } = getCampaignStatusMeta(campaign.status.key);
  if (tab !== 'live' || final) return null;
  const { timers, seatFreed } = campaign;
  if (campaign.status.key === 'suspended') {
    return {
      kind: 'suspended',
      dueAt: timers.suspension?.endsAt ?? null,
      windowMs: CAMPAIGN_SUSPENSION_WINDOW_MS,
    };
  }
  if (timers.zeroApplicants) {
    return {
      kind: 'zeroApplicants',
      dueAt: timers.zeroApplicants.decideBy,
      windowMs: CAMPAIGN_ZERO_APPLICANTS_WINDOW_MS,
    };
  }
  if (timers.ghost && now >= timers.ghost.warnsAt) {
    return {
      kind: 'ghost',
      dueAt: timers.ghost.suspendsAt,
      windowMs: Math.max(HOUR_MS, timers.ghost.suspendsAt - timers.ghost.warnsAt),
    };
  }
  if (seatFreed) return { kind: 'seatFreed', freeSeats: seatFreed.freeSeats };
  return null;
};

export type CampaignCountdownUnit = 'days' | 'hours' | 'minutes';

export interface CampaignCountdown {
  /** Share of the window still left, 0–1: the ring drains toward 0. */
  remaining: number;
  unit: CampaignCountdownUnit;
  value: number;
}

/** The ring's number: whole days while there are more than one, then hours, then minutes (rounded up so «0» never shows early). */
export const campaignCountdown = (dueAt: Timestamp, windowMs: number, now: number): CampaignCountdown => {
  const left = Math.max(0, dueAt - now);
  const remaining = Math.min(1, left / windowMs);
  if (left >= DAY_MS) return { remaining, unit: 'days', value: Math.ceil(left / DAY_MS) };
  if (left >= HOUR_MS) return { remaining, unit: 'hours', value: Math.ceil(left / HOUR_MS) };
  return { remaining, unit: 'minutes', value: Math.ceil(left / MINUTE_MS) };
};

/**
 * Terms freeze at the first application (contract §3.3). The server owns the lock; the list and
 * detail carry no flag, so a taken seat or an open application stands in for it.
 */
export const campaignTermsLocked = ({ status, counters }: Pick<CampaignDetail, 'status' | 'counters'>): boolean =>
  getCampaignStatusMeta(status.key).tab === 'live' && (counters.seatsOccupied > 0 || counters.applicationsOpen > 0);

/** How the terms stand on the page: under the team's review, frozen by an application, still the brand's to change, or past changing. */
export type CampaignTermsState = 'review' | 'locked' | 'editable' | 'static';

export const campaignTermsState = (campaign: Pick<CampaignDetail, 'status' | 'counters'>): CampaignTermsState => {
  const status = campaign.status.key;
  if (status === 'pending_review') return 'review';
  if (campaignTermsLocked(campaign)) return 'locked';
  return status === 'draft' || status === 'changes_requested' || status === 'open' || status === 'suspended'
    ? 'editable'
    : 'static';
};

export interface CampaignHistoryEvent {
  id: string;
  /** A note (`from == to`) is an event on the way, not a step of the lifecycle. */
  note: boolean;
  /** Lifecycle step: the status reached. Note: what happened, in the app's words when it knows the reason. */
  titleKey: CampaignHistoryReasonKey | null;
  title: string;
  /** Why a transition happened, when the app knows the reason. */
  whyKey: CampaignHistoryReasonKey | null;
  actor: string;
  occurredAt: Timestamp;
}

const isHistoryReason = (value: string): value is CampaignHistoryReason =>
  Object.prototype.hasOwnProperty.call(CAMPAIGN_HISTORY_REASON, value);

const knownReason = (reason: string | null): CampaignHistoryReasonKey | null =>
  reason !== null && isHistoryReason(reason) ? CAMPAIGN_HISTORY_REASON[reason] : null;

/** Newest first. A note with a reason the app doesn't know shows the row's own label instead of nothing. */
export const campaignHistoryEvents = (rows: readonly CampaignHistoryRow[]): CampaignHistoryEvent[] =>
  [...rows]
    .sort((a, b) => b.occurredAt - a.occurredAt)
    .map(row => {
      const note = row.from !== null && row.from.key === row.to.key;
      const key = knownReason(row.reason);
      return {
        id: row.id,
        note,
        titleKey: note ? key : null,
        title: row.to.label,
        whyKey: note ? null : key,
        actor: row.actor.label,
        occurredAt: row.occurredAt,
      };
    });
