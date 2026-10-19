import type { ParseKeys } from 'i18next';
import { CAMPAIGN_SUSPENSION_WINDOW_MS } from '../constants/campaignDetail';
import { CAMPAIGN_STATIONS, type CampaignStation } from '../constants/campaignStatus';
import type { CampaignDetail } from '../types/campaign';
import type { Timestamp } from '../types/deal';
import { campaignCountdown, type CampaignCountdownUnit } from './campaignDetail';
import { formatCampaignDate } from './campaignSchedule';
import { getCampaignStatusMeta } from './campaignStatus';

// The campaign's journey, as the five stations the list card also draws: reviewed, taking
// applications, seats filling, running, done. Pure data (copy keys, no JSX).

export type JourneyState = 'done' | 'current' | 'next';

export interface JourneyCopy {
  key: ParseKeys;
  params?: Record<string, string | number>;
}

/** The time a station is waiting on (the application deadline, or the automatic cancellation). */
export interface JourneyWindow {
  label: 'deadline' | 'cancelAt';
  /** Share of the window still left, 0–1. */
  remaining: number;
  timeLeft: { value: number; unit: CampaignCountdownUnit } | null;
}

export type JourneyPanel =
  | { kind: 'text'; copy: JourneyCopy }
  | { kind: 'window'; window: JourneyWindow | null; applicants: number };

export interface JourneyStation {
  key: CampaignStation;
  state: JourneyState;
  summary: JourneyCopy;
  panel: JourneyPanel;
}

/** One past the last station: every station is behind a finished campaign. */
const PAST_END = CAMPAIGN_STATIONS.length;

/** The station the status stands on; `null` for a campaign that ended without finishing (no journey to show). */
const currentIndex = (campaign: CampaignDetail): number | null => {
  const status = campaign.status.key;
  switch (status) {
    case 'draft':
    case 'changes_requested':
      return 0;
    case 'completed':
      return PAST_END;
    case 'pending_review':
    case 'open':
    case 'suspended':
    case 'closed':
    case 'filled':
      return getCampaignStatusMeta(status).station;
    case 'cancelled':
    case 'rejected':
    case 'removed':
    case null:
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

const text = (key: ParseKeys): JourneyPanel => ({ kind: 'text', copy: { key } });
const copy = (key: ParseKeys, params?: JourneyCopy['params']): JourneyCopy => ({ key, params });

const windowOf = (campaign: CampaignDetail, now: Timestamp): JourneyWindow | null => {
  const suspended = campaign.status.key === 'suspended';
  const dueAt = suspended ? (campaign.timers.suspension?.endsAt ?? null) : campaign.applyDeadlineAt;
  if (dueAt === null) return null;
  const label = suspended ? 'cancelAt' : 'deadline';
  if (dueAt <= now) return { label, remaining: 0, timeLeft: null };
  const span = suspended ? CAMPAIGN_SUSPENSION_WINDOW_MS : Math.max(1, dueAt - (campaign.publishedAt ?? campaign.createdAt));
  const { remaining, value, unit } = campaignCountdown(dueAt, span, now);
  return { label, remaining, timeLeft: { value, unit } };
};

const station = (
  key: CampaignStation,
  index: number,
  current: number,
  campaign: CampaignDetail,
  now: Timestamp,
): JourneyStation => {
  const state: JourneyState = index < current ? 'done' : index === current ? 'current' : 'next';
  const status = campaign.status.key;
  const { seatsOccupied, applicationsOpen } = campaign.counters;
  const base = { key, state };
  switch (key) {
    case 'review':
      if (state === 'done') {
        return { ...base, summary: copy('marketplace.campaign.detail.journey.sum.approved'), panel: text('marketplace.campaign.detail.journey.panel.reviewDone') };
      }
      if (status === 'pending_review') {
        return { ...base, summary: copy('marketplace.campaign.detail.journey.sum.reviewing'), panel: text('marketplace.campaign.detail.journey.panel.reviewing') };
      }
      return status === 'changes_requested'
        ? { ...base, summary: copy('marketplace.campaign.detail.journey.sum.awaitingEdits'), panel: text('marketplace.campaign.detail.journey.panel.changes') }
        : { ...base, summary: copy('marketplace.campaign.detail.journey.sum.draftNotSent'), panel: text('marketplace.campaign.detail.journey.panel.draft') };
    case 'apply': {
      if (state === 'next') {
        return { ...base, summary: copy('marketplace.campaign.detail.journey.sum.afterApproval'), panel: text('marketplace.campaign.detail.journey.panel.applyNext') };
      }
      if (state === 'done') {
        return { ...base, summary: copy('marketplace.campaign.detail.journey.sum.applyClosed'), panel: text('marketplace.campaign.detail.journey.panel.applyDone') };
      }
      const due = status === 'suspended' ? (campaign.timers.suspension?.endsAt ?? null) : campaign.applyDeadlineAt;
      const date = due === null ? null : formatCampaignDate(due);
      const summary =
        status === 'suspended'
          ? date === null
            ? copy('marketplace.campaign.detail.journey.sum.suspendedNoDate')
            : copy('marketplace.campaign.detail.journey.sum.suspended', { date })
          : date === null
            ? copy('marketplace.campaign.detail.journey.sum.applyOpen')
            : copy('marketplace.campaign.detail.journey.sum.applyUntil', { date });
      return { ...base, summary, panel: { kind: 'window', window: windowOf(campaign, now), applicants: applicationsOpen } };
    }
    case 'seats': {
      const summary =
        seatsOccupied > 0
          ? copy('marketplace.campaign.detail.journey.sum.seatsPicked', { occupied: seatsOccupied, total: campaign.seatsTotal })
          : copy('marketplace.campaign.detail.journey.sum.afterPicking');
      const panel =
        state === 'next'
          ? 'marketplace.campaign.detail.journey.panel.seatsNext'
          : state === 'current'
            ? 'marketplace.campaign.detail.journey.panel.seatsClosed'
            : 'marketplace.campaign.detail.journey.panel.seatsDone';
      return { ...base, summary, panel: text(panel) };
    }
    case 'run':
      if (state === 'done') {
        return { ...base, summary: copy('marketplace.campaign.detail.journey.sum.runDone'), panel: text('marketplace.campaign.detail.journey.panel.runDone') };
      }
      return state === 'current'
        ? { ...base, summary: copy('marketplace.campaign.detail.journey.sum.running'), panel: text('marketplace.campaign.detail.journey.panel.runCurrent') }
        : { ...base, summary: copy('marketplace.campaign.detail.journey.sum.notStarted'), panel: text('marketplace.campaign.detail.journey.panel.runNext') };
    case 'done':
      return state === 'done'
        ? { ...base, summary: copy('marketplace.campaign.detail.journey.sum.done'), panel: text('marketplace.campaign.detail.journey.panel.doneDone') }
        : { ...base, summary: copy('marketplace.campaign.detail.journey.sum.afterVerify'), panel: text('marketplace.campaign.detail.journey.panel.doneNext') };
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
};

/** The five stations with where the campaign stands; `null` when it ended without finishing. */
export const campaignJourney = (campaign: CampaignDetail, now: Timestamp): JourneyStation[] | null => {
  const current = currentIndex(campaign);
  if (current === null) return null;
  return CAMPAIGN_STATIONS.map((key, index) => station(key, index, current, campaign, now));
};
