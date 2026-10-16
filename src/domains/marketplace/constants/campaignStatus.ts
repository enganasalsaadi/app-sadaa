import type { HueTone } from '@/core/theme';
import type { ApplicationStatus, CampaignStatus } from '../types';

/**
 * Campaign / application statuses. Labels always come from the server (`status.label`); the app owns
 * only tone and the tab grouping (rule 06). A `Record` map: a new status fails the build until handled.
 */

/** Brand "My campaigns" tabs (`GET /brand/campaigns?status[]=…`). */
export const CAMPAIGN_TABS = ['drafts', 'review', 'live', 'finished'] as const;
export type CampaignTab = (typeof CAMPAIGN_TABS)[number];

export interface CampaignStatusMeta {
  /** Rule 08: warning = needs the brand, info = waiting on someone else, teal = moving. */
  tone: HueTone;
  tab: CampaignTab;
  /** No further transition is possible. */
  final: boolean;
  /** Creators can read it (published at least once); `cancelled` / `removed` are 404 for them. */
  readableByCreator: boolean;
}

export const CAMPAIGN_STATUS_META = {
  draft: { tone: 'neutral', tab: 'drafts', final: false, readableByCreator: false },
  pending_review: { tone: 'info', tab: 'review', final: false, readableByCreator: false },
  changes_requested: { tone: 'warning', tab: 'drafts', final: false, readableByCreator: false },
  open: { tone: 'interactive', tab: 'live', final: false, readableByCreator: true },
  suspended: { tone: 'warning', tab: 'live', final: false, readableByCreator: true },
  filled: { tone: 'success', tab: 'live', final: false, readableByCreator: true },
  closed: { tone: 'neutral', tab: 'live', final: false, readableByCreator: true },
  completed: { tone: 'success', tab: 'finished', final: true, readableByCreator: true },
  cancelled: { tone: 'neutral', tab: 'finished', final: true, readableByCreator: false },
  rejected: { tone: 'danger', tab: 'finished', final: true, readableByCreator: false },
  removed: { tone: 'danger', tab: 'finished', final: true, readableByCreator: false },
} as const satisfies Record<CampaignStatus, CampaignStatusMeta>;

/** A status this build doesn't know yet (server ahead of the app). */
export const UNKNOWN_CAMPAIGN_STATUS_META: CampaignStatusMeta = {
  tone: 'neutral',
  tab: 'live',
  final: false,
  readableByCreator: false,
};

/** The `status[]` filter each brand tab sends. */
export const CAMPAIGN_TAB_STATUSES = {
  drafts: ['draft', 'changes_requested'],
  review: ['pending_review'],
  live: ['open', 'suspended', 'filled', 'closed'],
  finished: ['completed', 'cancelled', 'rejected', 'removed'],
} as const satisfies Record<CampaignTab, readonly CampaignStatus[]>;

/** Creator "My applications" tabs. */
export const APPLICATION_TABS = ['open', 'selected', 'closed'] as const;
export type ApplicationTab = (typeof APPLICATION_TABS)[number];

export interface ApplicationStatusMeta {
  tone: HueTone;
  tab: ApplicationTab;
  /** Submitted / shortlisted: counts toward the creator's 10 open applications. */
  pending: boolean;
}

export const APPLICATION_STATUS_META = {
  submitted: { tone: 'info', tab: 'open', pending: true },
  shortlisted: { tone: 'interactive', tab: 'open', pending: true },
  selected: { tone: 'success', tab: 'selected', pending: false },
  withdrawn: { tone: 'neutral', tab: 'closed', pending: false },
  expired: { tone: 'neutral', tab: 'closed', pending: false },
  // "Not selected" is shown neutrally: the creator never sees a reason or a danger tone.
  rejected: { tone: 'neutral', tab: 'closed', pending: false },
  not_selected: { tone: 'neutral', tab: 'closed', pending: false },
  cancelled: { tone: 'neutral', tab: 'closed', pending: false },
} as const satisfies Record<ApplicationStatus, ApplicationStatusMeta>;

export const UNKNOWN_APPLICATION_STATUS_META: ApplicationStatusMeta = {
  tone: 'neutral',
  tab: 'closed',
  pending: false,
};

export const APPLICATION_TAB_STATUSES = {
  open: ['submitted', 'shortlisted'],
  selected: ['selected'],
  closed: ['expired', 'rejected', 'not_selected', 'withdrawn', 'cancelled'],
} as const satisfies Record<ApplicationTab, readonly ApplicationStatus[]>;
