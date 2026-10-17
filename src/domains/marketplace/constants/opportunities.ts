import type { ParseKeys } from 'i18next';
import type {
  CampaignGender,
  CampaignPricingModel,
  CreatorApplicationsArgs,
  CreatorFeedArgs,
} from '../types/campaign';
import { APPLICATION_TAB_STATUSES, type ApplicationTab } from './campaignStatus';

/** The Opportunities tab's three destinations: the ranked feed, bookmarks, my applications. */
export const OPPORTUNITY_SEGMENTS = ['feed', 'saved', 'applications'] as const;
export type OpportunitySegment = (typeof OPPORTUNITY_SEGMENTS)[number];

export const DEFAULT_OPPORTUNITY_SEGMENT: OpportunitySegment = 'feed';

export const OPPORTUNITY_SEGMENT_LABEL = {
  feed: 'marketplace.campaign.feed.segments.feed',
  saved: 'marketplace.campaign.feed.segments.saved',
  applications: 'marketplace.campaign.feed.segments.applications',
} as const satisfies Record<OpportunitySegment, string>;

/** The only filters the feed API takes (`activity_type[]`, `pricing_model`). */
export const DEFAULT_OPPORTUNITY_FILTERS: Required<CreatorFeedArgs> = {
  activityTypes: [],
  pricingModel: null,
};

export const OPPORTUNITY_PRICING_LABEL = {
  fixed: 'marketplace.campaign.feed.filters.fixed',
  bidding: 'marketplace.campaign.feed.filters.bidding',
} as const satisfies Record<CampaignPricingModel, string>;

/** Deliverable chips on a card before «+N»: more than this stops reading as one line. */
export const OPPORTUNITY_MAX_DELIVERABLES = 3;

export const OPPORTUNITY_GENDER_LABEL = {
  male: 'common.gender.male',
  female: 'common.gender.female',
} as const satisfies Record<CampaignGender, ParseKeys>;

/** What each «my applications» tab asks the server for; stable objects, so a tab is one cache entry. */
export const APPLICATION_TAB_ARGS: Record<ApplicationTab, CreatorApplicationsArgs> = {
  open: { statuses: [...APPLICATION_TAB_STATUSES.open] },
  selected: { statuses: [...APPLICATION_TAB_STATUSES.selected] },
  closed: { statuses: [...APPLICATION_TAB_STATUSES.closed] },
};

export const APPLICATION_TAB_DEF = {
  open: {
    label: 'marketplace.campaign.applications.tabs.open',
    emptyTitle: 'marketplace.campaign.applications.empty.open.title',
    emptyHint: 'marketplace.campaign.applications.empty.open.hint',
  },
  selected: {
    label: 'marketplace.campaign.applications.tabs.selected',
    emptyTitle: 'marketplace.campaign.applications.empty.selected.title',
    emptyHint: 'marketplace.campaign.applications.empty.selected.hint',
  },
  closed: {
    label: 'marketplace.campaign.applications.tabs.closed',
    emptyTitle: 'marketplace.campaign.applications.empty.closed.title',
    emptyHint: 'marketplace.campaign.applications.empty.closed.hint',
  },
} as const satisfies Record<ApplicationTab, { label: ParseKeys; emptyTitle: ParseKeys; emptyHint: ParseKeys }>;
