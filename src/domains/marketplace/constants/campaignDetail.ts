import type { ParseKeys } from 'i18next';

const DAY_MS = 86_400_000;

/** Silence for this long auto-cancels a suspended campaign / one nobody applied to (contract §3.4). */
export const CAMPAIGN_SUSPENSION_WINDOW_MS = 7 * DAY_MS;
export const CAMPAIGN_ZERO_APPLICANTS_WINDOW_MS = 7 * DAY_MS;

/** The note reasons the history can carry (contract §3.3); an unknown one falls back to the row's own label. */
export const CAMPAIGN_HISTORY_REASON = {
  applied: 'marketplace.campaign.detail.history.reason.applied',
  campaign_edited: 'marketplace.campaign.detail.history.reason.campaign_edited',
  seat_freed: 'marketplace.campaign.detail.history.reason.seat_freed',
  ghost_warning: 'marketplace.campaign.detail.history.reason.ghost_warning',
  deadline_reached: 'marketplace.campaign.detail.history.reason.deadline_reached',
  zero_applicants: 'marketplace.campaign.detail.history.reason.zero_applicants',
  zero_applicants_extended: 'marketplace.campaign.detail.history.reason.zero_applicants_extended',
} as const satisfies Record<string, ParseKeys>;
export type CampaignHistoryReason = keyof typeof CAMPAIGN_HISTORY_REASON;
export type CampaignHistoryReasonKey = (typeof CAMPAIGN_HISTORY_REASON)[CampaignHistoryReason];

/** The ring's unit under its number. */
export const CAMPAIGN_COUNTDOWN_UNIT = {
  days: 'marketplace.campaign.detail.island.unit.days',
  hours: 'marketplace.campaign.detail.island.unit.hours',
  minutes: 'marketplace.campaign.detail.island.unit.minutes',
} as const satisfies Record<'days' | 'hours' | 'minutes', ParseKeys>;
