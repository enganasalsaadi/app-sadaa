import type { Labeled, Timestamp } from './deal';
import type { DealLabeledDto } from './dealDto';
import type { CampaignStatus, CreatorCampaign } from './campaign';
import type { CreatorCampaignDto } from './campaignDto';

// Brand Home «my active campaigns» (contract §6.1). The server decides what needs the brand and what
// to say about it; the app owns only where each action leads.

/** What the brand should do next with a campaign, in the server's priority order. */
export const BRAND_CAMPAIGN_ACTION = [
  'fund_seats',
  'reopen',
  'seat_freed',
  'fix_draft',
  'review_applicants',
] as const;
export type BrandCampaignAction = (typeof BRAND_CAMPAIGN_ACTION)[number];

export interface BrandActiveCampaignDto {
  id: string;
  title: string;
  status: DealLabeledDto;
  seats: { total: number; occupied: number; left: number };
  applications_open: number;
  awaiting_payment_count: number;
  apply_deadline_at: string | null;
  drop_at: string | null;
  budget_secured: boolean;
  needs_action: boolean;
  action: DealLabeledDto | null;
}

export interface BrandActiveCampaignsDto {
  needs_action_count: number;
  total_count: number;
  items: BrandActiveCampaignDto[];
}

export interface BrandActiveCampaign {
  id: string;
  title: string;
  status: Labeled<CampaignStatus>;
  /** `free` = the wire's `left` (the RTL lint bans that word as an object key). */
  seats: { total: number; occupied: number; free: number };
  /** Pending applications waiting for a decision. */
  applicationsOpen: number;
  /** Seats whose linked deal still waits for the brand's money. */
  awaitingPaymentCount: number;
  applyDeadlineAt: Timestamp | null;
  dropAt: Timestamp | null;
  budgetSecured: boolean;
  needsAction: boolean;
  /** Unknown key (newer server) keeps the server label and opens the campaign. */
  action: Labeled<BrandCampaignAction> | null;
}

/** Up to 5 campaigns, needing-action first; the counts cover every active campaign. */
export interface BrandActiveCampaigns {
  needsActionCount: number;
  totalCount: number;
  items: BrandActiveCampaign[];
}

// Creator Home «campaigns for you» (contract §6.3): the counts and up to 3 of the feed's own cards.

export interface CreatorCampaignsDto {
  feed_count: number;
  new_invites: number;
  open_applications: number;
  items?: CreatorCampaignDto[];
}

/** Counts are the server's; `items` are the feed's first cards, already ranked (invitations first). */
export interface CreatorCampaignsGlance {
  /** Campaigns the creator can apply to right now (the feed's total). */
  feedCount: number;
  /** Unseen invitations to campaigns still accepting applications; they badge the tab. */
  newInvites: number;
  /** Applications submitted or shortlisted. */
  openApplications: number;
  items: CreatorCampaign[];
}
