import type { ParseKeys } from 'i18next';
import type { DealStatus } from '../types';
import { DEAL_STATUS } from '../types';
import { DEAL_STATUS_META } from './dealStatus';

/** The brand's status groups: each deal sits in exactly one, and each is its own query. */
export const BRAND_DEAL_TABS = ['waiting', 'ongoing', 'drafts', 'closed'] as const;
export type BrandDealTab = (typeof BRAND_DEAL_TABS)[number];

/** The chips of «direct requests»: the groups, plus «all» and «waiting on you» (picked from what is loaded). */
export const BRAND_DEAL_FILTERS = ['all', 'onYou', ...BRAND_DEAL_TABS] as const;
export type BrandDealFilter = (typeof BRAND_DEAL_FILTERS)[number];

/** Opens on everything, with what waits on the brand first. */
export const DEFAULT_BRAND_DEAL_FILTER: BrandDealFilter = 'all';

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
  waiting: {
    statuses: NEW_OFFERS,
    label: 'marketplace.deals.filters.waiting',
    emptyTitle: 'marketplace.deals.empty.waiting.title',
    emptyHint: 'marketplace.deals.empty.waiting.hint',
  },
  ongoing: {
    statuses: OPEN_SENT.filter(status => !NEW_OFFERS.includes(status)),
    label: 'marketplace.deals.filters.ongoing',
    emptyTitle: 'marketplace.deals.empty.ongoing.title',
    emptyHint: 'marketplace.deals.empty.ongoing.hint',
  },
  drafts: {
    statuses: ['draft'],
    label: 'marketplace.deals.filters.drafts',
    emptyTitle: 'marketplace.deals.empty.drafts.title',
    emptyHint: 'marketplace.deals.empty.drafts.hint',
  },
  closed: {
    statuses: CLOSED,
    label: 'marketplace.deals.filters.closed',
    emptyTitle: 'marketplace.deals.empty.closed.title',
    emptyHint: 'marketplace.deals.empty.closed.hint',
  },
} as const satisfies Record<BrandDealTab, DealListTabDef>;

/**
 * Copy of the two chips that are not a status group. «All» reads every status in one query;
 * «waiting on you» is worked out client-side from the open groups (a UX hint, rule 06).
 */
export const BRAND_DEAL_EXTRA_DEF = {
  all: {
    statuses: DEAL_STATUS,
    label: 'marketplace.deals.filters.all',
    emptyTitle: 'marketplace.deals.empty.all.title',
    emptyHint: 'marketplace.deals.empty.all.hint',
  },
  onYou: {
    statuses: OPEN_SENT,
    label: 'marketplace.deals.filters.onYou',
    emptyTitle: 'marketplace.deals.empty.onYou.title',
    emptyHint: 'marketplace.deals.empty.onYou.hint',
  },
} as const satisfies Record<Exclude<BrandDealFilter, BrandDealTab>, DealListTabDef>;

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
