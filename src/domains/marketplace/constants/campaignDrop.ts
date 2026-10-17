import type { HueTone } from '@/core/theme';
import type { CampaignDropState } from '../types/campaignDrop';

/** Color role of each state. The label next to it always says it too (rule 08); `null` = unknown state. */
export const CAMPAIGN_DROP_STATE_TONE = {
  awaiting_payment: 'neutral',
  working: 'interactive',
  in_review: 'info',
  late: 'warning',
  verified: 'success',
  defaulted: 'danger',
  ended: 'neutral',
} as const satisfies Record<CampaignDropState, HueTone>;

export const UNKNOWN_CAMPAIGN_DROP_STATE_TONE: HueTone = 'neutral';

/** Rows: whoever needs the brand's eye first (late), then the live work, then what is settled. */
export const CAMPAIGN_DROP_LANE_ORDER = [
  'late',
  'working',
  'in_review',
  'awaiting_payment',
  'verified',
  'defaulted',
  'ended',
] as const satisfies readonly CampaignDropState[];

/** Squad bar: reads left→right as progress toward live. */
export const CAMPAIGN_DROP_BAR_ORDER = [
  'verified',
  'in_review',
  'working',
  'late',
  'awaiting_payment',
  'defaulted',
  'ended',
] as const satisfies readonly CampaignDropState[];

/** Filter chips, in the order they appear (only the non-empty ones show). */
export const CAMPAIGN_DROP_FILTER_ORDER = [
  'late',
  'working',
  'in_review',
  'verified',
  'awaiting_payment',
  'defaulted',
  'ended',
] as const satisfies readonly CampaignDropState[];
