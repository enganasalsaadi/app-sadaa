import type { ParseKeys } from 'i18next';
import type { DealStatus } from '../types';
import { DEAL_STATUS } from '../types';
import { DEAL_STATUS_META } from './dealStatus';

export const BRAND_DEAL_TABS = ['active', 'drafts', 'closed'] as const;
export type BrandDealTab = (typeof BRAND_DEAL_TABS)[number];

export const CREATOR_DEAL_TABS = ['new', 'active', 'closed'] as const;
export type CreatorDealTab = (typeof CREATOR_DEAL_TABS)[number];

export type DealListTab = BrandDealTab | CreatorDealTab;

export interface DealListTabDef {
  /** Server filter (`status[]`); every tab names its statuses so a new one never leaks in. */
  statuses: readonly DealStatus[];
  label: ParseKeys;
  emptyTitle: ParseKeys;
  emptyHint: ParseKeys;
}

const NEW_OFFERS: readonly DealStatus[] = [
  'pending_influencer',
  'negotiating_deadline',
];
const CLOSED: readonly DealStatus[] = DEAL_STATUS.filter(
  status => DEAL_STATUS_META[status].outcome !== 'open',
);
const OPEN_SENT: readonly DealStatus[] = DEAL_STATUS.filter(
  status => DEAL_STATUS_META[status].outcome === 'open' && status !== 'draft',
);

export const BRAND_DEAL_TAB_DEF = {
  active: {
    statuses: OPEN_SENT,
    label: 'marketplace.deals.tabs.active',
    emptyTitle: 'marketplace.deals.empty.brandActive.title',
    emptyHint: 'marketplace.deals.empty.brandActive.hint',
  },
  drafts: {
    statuses: ['draft'],
    label: 'marketplace.deals.tabs.drafts',
    emptyTitle: 'marketplace.deals.empty.drafts.title',
    emptyHint: 'marketplace.deals.empty.drafts.hint',
  },
  closed: {
    statuses: CLOSED,
    label: 'marketplace.deals.tabs.closed',
    emptyTitle: 'marketplace.deals.empty.closed.title',
    emptyHint: 'marketplace.deals.empty.closed.hint',
  },
} as const satisfies Record<BrandDealTab, DealListTabDef>;

export const CREATOR_DEAL_TAB_DEF = {
  new: {
    statuses: NEW_OFFERS,
    label: 'marketplace.deals.tabs.new',
    emptyTitle: 'marketplace.deals.empty.creatorNew.title',
    emptyHint: 'marketplace.deals.empty.creatorNew.hint',
  },
  active: {
    statuses: OPEN_SENT.filter(status => !NEW_OFFERS.includes(status)),
    label: 'marketplace.deals.tabs.ongoing',
    emptyTitle: 'marketplace.deals.empty.creatorActive.title',
    emptyHint: 'marketplace.deals.empty.creatorActive.hint',
  },
  closed: {
    statuses: CLOSED,
    label: 'marketplace.deals.tabs.closed',
    emptyTitle: 'marketplace.deals.empty.closed.title',
    emptyHint: 'marketplace.deals.empty.closed.hint',
  },
} as const satisfies Record<CreatorDealTab, DealListTabDef>;
