import type { Money } from '@/core/money';
import { CAMPAIGN_ACTIVITY_TYPE } from '../types/campaign';
import type {
  CampaignActivityType,
  CampaignEligibilityReasonRow,
  CreatorCampaign,
  CreatorCampaignPricing,
  CreatorFeedArgs,
} from '../types/campaign';
import { campaignTimeLeft } from './campaignList';

/** What the creator takes home, as the card's headline: a number, or the span a bid could land in. */
export type NetHeadline = { kind: 'fixed'; net: Money } | { kind: 'range'; min: Money; max: Money };

/** The creator's take (`net`) from the server's own breakdown, never gross; a bid whose ends meet reads as one number. */
export const netHeadline = ({ fixed, bid }: CreatorCampaignPricing): NetHeadline | null => {
  if (fixed) return { kind: 'fixed', net: fixed.net };
  if (!bid) return null;
  if (bid.min.net.amount === bid.max.net.amount) return { kind: 'fixed', net: bid.max.net };
  return { kind: 'range', min: bid.min.net, max: bid.max.net };
};

/** The share of the campaign price the creator keeps (0–1), from the server's own gross and net; `null` when there's no fixed price. */
export const netShare = ({ fixed }: CreatorCampaignPricing): number | null =>
  fixed && fixed.gross.amount > 0 ? Math.min(1, Math.max(0, fixed.net.amount / fixed.gross.amount)) : null;

/** Fraction of the recruiting window still open (1 = just published, 0 = closed); `null` without both ends. */
export const deadlineRemaining = (publishedAt: number | null, endsAt: number | null, now: number): number | null => {
  if (publishedAt === null || endsAt === null || endsAt <= publishedAt) return null;
  return Math.min(1, Math.max(0, (endsAt - now) / (endsAt - publishedAt)));
};

export type OpportunityDeadline =
  | { unit: 'days' | 'hours'; count: number; urgent: boolean }
  | { unit: 'lastHour'; urgent: true };

/** «3 days to apply»: the biggest whole unit left; a day or less runs warm. `null` once it closed or none is set. */
export const opportunityDeadline = (endsAt: number | null, now: number): OpportunityDeadline | null => {
  const left = campaignTimeLeft(endsAt, now);
  if (!left) return null;
  if (left.unit === 'days') return { unit: 'days', count: left.days, urgent: false };
  if (left.unit === 'hours') return { unit: 'hours', count: left.hours, urgent: true };
  return { unit: 'lastHour', urgent: true };
};

/** The feed shows everything the creator may apply to, plus campaigns waiting only on their gender (contract §4.1). */
export const genderRequiredReason = ({ eligibility }: Pick<CreatorCampaign, 'eligibility'>): CampaignEligibilityReasonRow | null =>
  eligibility.reasons.find(reason => reason.key === 'gender_required') ?? null;

export const isActivityType = (value: string): value is CampaignActivityType =>
  (CAMPAIGN_ACTIVITY_TYPE as readonly string[]).includes(value);

/** Types in the order the server lists them, so one selection is one cache entry whatever order it was tapped in. */
export const toFeedArgs = ({ activityTypes = [], pricingModel = null }: CreatorFeedArgs): CreatorFeedArgs => ({
  activityTypes: [...activityTypes].sort(
    (a, b) => CAMPAIGN_ACTIVITY_TYPE.indexOf(a) - CAMPAIGN_ACTIVITY_TYPE.indexOf(b),
  ),
  pricingModel,
});

export const countActiveFeedFilters = ({ activityTypes = [], pricingModel = null }: CreatorFeedArgs): number =>
  activityTypes.length + (pricingModel ? 1 : 0);

/** Flips the bookmark of one campaign in a loaded page (the optimistic patch); other rows stay. */
export const setBookmarkedIn = (items: CreatorCampaign[], id: string, bookmarked: boolean): void => {
  items.forEach(item => {
    if (item.id === id) item.bookmarked = bookmarked;
  });
};

export const isAlreadyApplied = ({ eligibility }: Pick<CreatorCampaign, 'eligibility'>): boolean =>
  eligibility.reasons.some(reason => reason.key === 'already_applied');

/**
 * What the page's dock offers (contract §4.1): apply (a bid for a bidding campaign) when the server says
 * so; the profile when the only thing missing is the creator's gender; otherwise the server's own words
 * for why not. A campaign that stopped recruiting is `closed` (its reasons, if any, still show).
 */
export type ApplyAction =
  | { kind: 'apply' | 'bid' | 'gender' }
  | { kind: 'blocked' | 'closed'; reasons: CampaignEligibilityReasonRow[] };

export const applyAction = ({
  acceptingApplications,
  eligibility,
  pricing,
}: Pick<CreatorCampaign, 'acceptingApplications' | 'eligibility' | 'pricing'>): ApplyAction => {
  const { reasons } = eligibility;
  if (!acceptingApplications) return { kind: 'closed', reasons };
  if (!eligibility.eligible) {
    const onlyGender = reasons.length > 0 && reasons.every(reason => reason.key === 'gender_required');
    return onlyGender ? { kind: 'gender' } : { kind: 'blocked', reasons };
  }
  return { kind: pricing.bid ? 'bid' : 'apply' };
};
