import type { CampaignPricingModel, CreatorFeedArgs } from '../types/campaign';

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
