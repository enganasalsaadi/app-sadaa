import type { DealStatus, Labeled, Timestamp } from './deal';

// Drop dashboard (contract §3.7, CM8). Same stance as the other campaign types: unknown enum values from
// a newer server map to `null` and the server `label` still renders.

/** Where one linked creator stands for the drop (`creators[].state.key`). */
export const CAMPAIGN_DROP_STATE = [
  'awaiting_payment',
  'working',
  'in_review',
  'late',
  'verified',
  'defaulted',
  'ended',
] as const;
export type CampaignDropState = (typeof CAMPAIGN_DROP_STATE)[number];

export const CAMPAIGN_DROP_PHASE = ['upcoming', 'publish_open', 'live'] as const;
export type CampaignDropPhase = (typeof CAMPAIGN_DROP_PHASE)[number];

/** `linked` is every creator of the drop; the rest are the states, counted. */
export type CampaignDropTotals = Record<CampaignDropState | 'linked', number>;

/** A reminder the server sends the creators (24 h, 2 h and at the drop). */
export interface CampaignDropReminder {
  minutesBefore: number;
  at: Timestamp;
  sent: boolean;
}

export interface CampaignDropCreator {
  dealId: string;
  state: Labeled<CampaignDropState>;
  dealStatus: Labeled<DealStatus>;
  slug: string | null;
  name: string | null;
  avatarUrl: string | null;
  items: { total: number; inReview: number; verified: number };
  /** The next moment the creator owes something by. */
  dueAt: Timestamp | null;
  /** Late only: the 24 h grace ends here, then the deal defaults. */
  lateUntil: Timestamp | null;
}

export interface CampaignDropBoard {
  campaignId: string;
  dropAt: Timestamp;
  publishOpensAt: Timestamp;
  draftDueAt: Timestamp;
  /** The server's phase at fetch time; the screen moves forward from the clock. */
  phase: CampaignDropPhase | null;
  reminders: CampaignDropReminder[];
  totals: CampaignDropTotals;
  creators: CampaignDropCreator[];
}
