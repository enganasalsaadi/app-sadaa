import type { ParseKeys } from 'i18next';
import { CAMPAIGN_TABS, CAMPAIGN_TAB_STATUSES } from './campaignStatus';
import type { CampaignStatus } from '../types';

/** The brand lets a draft sit until it is sent: this many (`draft` + `changes_requested`) at most. */
export const CAMPAIGN_DRAFT_LIMIT = 20;

/** The chips of «public campaigns»: «all», then the four status groups. */
export const CAMPAIGN_FILTERS = ['all', ...CAMPAIGN_TABS] as const;
export type CampaignFilter = (typeof CAMPAIGN_FILTERS)[number];

export interface CampaignTabDef {
  /** Server filter (`status[]`): the tab's own statuses so a new one never leaks in. */
  statuses: readonly CampaignStatus[];
  label: ParseKeys;
  emptyTitle: ParseKeys;
  emptyHint: ParseKeys;
}

export const CAMPAIGN_FILTER_DEF = {
  all: {
    statuses: CAMPAIGN_TABS.flatMap(tab => CAMPAIGN_TAB_STATUSES[tab]),
    label: 'marketplace.campaign.list.tabs.all',
    emptyTitle: 'marketplace.campaign.list.empty.all.title',
    emptyHint: 'marketplace.campaign.list.empty.all.hint',
  },
  drafts: {
    statuses: CAMPAIGN_TAB_STATUSES.drafts,
    label: 'marketplace.campaign.list.tabs.drafts',
    emptyTitle: 'marketplace.campaign.list.empty.drafts.title',
    emptyHint: 'marketplace.campaign.list.empty.drafts.hint',
  },
  review: {
    statuses: CAMPAIGN_TAB_STATUSES.review,
    label: 'marketplace.campaign.list.tabs.review',
    emptyTitle: 'marketplace.campaign.list.empty.review.title',
    emptyHint: 'marketplace.campaign.list.empty.review.hint',
  },
  live: {
    statuses: CAMPAIGN_TAB_STATUSES.live,
    label: 'marketplace.campaign.list.tabs.live',
    emptyTitle: 'marketplace.campaign.list.empty.live.title',
    emptyHint: 'marketplace.campaign.list.empty.live.hint',
  },
  finished: {
    statuses: CAMPAIGN_TAB_STATUSES.finished,
    label: 'marketplace.campaign.list.tabs.finished',
    emptyTitle: 'marketplace.campaign.list.empty.finished.title',
    emptyHint: 'marketplace.campaign.list.empty.finished.hint',
  },
} as const satisfies Record<CampaignFilter, CampaignTabDef>;

/** The chip a brand lands on: what is running. */
export const DEFAULT_CAMPAIGN_FILTER: CampaignFilter = 'live';
