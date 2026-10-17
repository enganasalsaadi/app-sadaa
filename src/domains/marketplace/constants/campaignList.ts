import type { ParseKeys } from 'i18next';
import { CAMPAIGN_TAB_STATUSES } from './campaignStatus';
import type { CampaignTab } from './campaignStatus';
import type { CampaignStatus } from '../types';

/** The brand lets a draft sit until it is sent: this many (`draft` + `changes_requested`) at most. */
export const CAMPAIGN_DRAFT_LIMIT = 20;

export interface CampaignTabDef {
  /** Server filter (`status[]`): the tab's own statuses so a new one never leaks in. */
  statuses: readonly CampaignStatus[];
  label: ParseKeys;
  /** «N campaigns …» under the title, plural by the tab's total. */
  count: ParseKeys;
  emptyTitle: ParseKeys;
  emptyHint: ParseKeys;
}

export const CAMPAIGN_TAB_DEF = {
  drafts: {
    statuses: CAMPAIGN_TAB_STATUSES.drafts,
    label: 'marketplace.campaign.list.tabs.drafts',
    count: 'marketplace.campaign.list.count.drafts',
    emptyTitle: 'marketplace.campaign.list.empty.drafts.title',
    emptyHint: 'marketplace.campaign.list.empty.drafts.hint',
  },
  review: {
    statuses: CAMPAIGN_TAB_STATUSES.review,
    label: 'marketplace.campaign.list.tabs.review',
    count: 'marketplace.campaign.list.count.review',
    emptyTitle: 'marketplace.campaign.list.empty.review.title',
    emptyHint: 'marketplace.campaign.list.empty.review.hint',
  },
  live: {
    statuses: CAMPAIGN_TAB_STATUSES.live,
    label: 'marketplace.campaign.list.tabs.live',
    count: 'marketplace.campaign.list.count.live',
    emptyTitle: 'marketplace.campaign.list.empty.live.title',
    emptyHint: 'marketplace.campaign.list.empty.live.hint',
  },
  finished: {
    statuses: CAMPAIGN_TAB_STATUSES.finished,
    label: 'marketplace.campaign.list.tabs.finished',
    count: 'marketplace.campaign.list.count.finished',
    emptyTitle: 'marketplace.campaign.list.empty.finished.title',
    emptyHint: 'marketplace.campaign.list.empty.finished.hint',
  },
} as const satisfies Record<CampaignTab, CampaignTabDef>;

/** The tab a brand lands on: what is running. */
export const DEFAULT_CAMPAIGN_TAB: CampaignTab = 'live';

/** Statuses read on their own for the «needs your decision» rail, whichever tab is open. */
export const CAMPAIGN_ATTENTION_STATUSES = ['changes_requested'] as const satisfies readonly CampaignStatus[];
