import { FOLLOWER_TIERS, type FollowerTierId } from '@/core/config';
import {
  APPLICANT_FOLLOWER_FLOORS,
  APPLICANT_TAB_DEF,
  APPLICANT_URGENT_HOURS,
  type ApplicantTab,
} from '../constants/applicants';
import type {
  ApplicantAccount,
  ApplicantCard,
  ApplicantFilters,
  ApplicantsArgs,
  CampaignStatus,
} from '../types/campaign';
import { campaignTimeLeft, type CampaignTimeLeft } from './campaignList';

const HOUR = 3_600_000;

/** A chosen creator's face on the seat rail. */
export interface SeatFace {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export const seatFaceOf = (card: Pick<ApplicantCard, 'id' | 'creator'>): SeatFace => ({
  id: card.id,
  name: card.creator.displayName,
  avatarUrl: card.creator.avatarUrl,
});

export const DEFAULT_APPLICANT_FILTERS: ApplicantFilters = {
  sort: 'newest',
  status: null,
  governorates: [],
  niches: [],
  minFollowers: null,
  invitedOnly: false,
};

/** Where the table opens: once the seats are taken (or the campaign is over) the chosen creators are the story. */
export const defaultApplicantTab = (status: CampaignStatus | null): ApplicantTab =>
  status === 'filled' || status === 'closed' || status === 'completed' ? 'selected' : 'new';

/** The tab's own status, or the «Status» filter when one is picked; filters ride along. */
export const toApplicantsArgs = (id: string, tab: ApplicantTab, filters: ApplicantFilters): ApplicantsArgs => ({
  id,
  statuses: [filters.status ?? APPLICANT_TAB_DEF[tab].status],
  sort: filters.sort,
  governorates: filters.governorates,
  niches: filters.niches,
  minFollowers: filters.minFollowers,
  invitedOnly: filters.invitedOnly,
});

/** Filters that narrow the list (the sort is an order, not a narrowing). */
export const countActiveFilters = (filters: ApplicantFilters): number =>
  (filters.status ? 1 : 0) +
  filters.governorates.length +
  filters.niches.length +
  (filters.minFollowers ? 1 : 0) +
  (filters.invitedOnly ? 1 : 0);

export const isDefaultApplicantFilters = (filters: ApplicantFilters): boolean =>
  countActiveFilters(filters) === 0 && filters.sort === DEFAULT_APPLICANT_FILTERS.sort;

/** `5000` is a floor the sheet offers; anything else (a stale value) shows no chip selected. */
export const isFollowerFloor = (value: number | null): value is (typeof APPLICANT_FOLLOWER_FLOORS)[number] =>
  APPLICANT_FOLLOWER_FLOORS.some(floor => floor === value);

export interface ApplicantExpiry {
  /** `null`: past the 72 h window (an expired row, or the clock just passed it). */
  remaining: CampaignTimeLeft | null;
  urgent: boolean;
}

/** The 72 h window left to decide, from the server's `expires_at`; urgent inside the last few hours. */
export const applicantExpiry = (expiresAt: number, now: number): ApplicantExpiry => ({
  remaining: campaignTimeLeft(expiresAt, now),
  urgent: expiresAt > now && expiresAt - now < APPLICANT_URGENT_HOURS * HOUR,
});

export type ReachedAccount = ApplicantAccount & { followerCount: number };

/** Accounts that report a follower count, biggest first: the card shows these as the creator's reach. */
export const accountsByReach = (accounts: readonly ApplicantAccount[]): ReachedAccount[] =>
  accounts
    .filter((account): account is ReachedAccount => account.followerCount !== null)
    .sort((a, b) => b.followerCount - a.followerCount);

/** Total followers across the campaign's platforms (`null` when none reported). */
export const totalFollowers = (accounts: readonly ApplicantAccount[]): number | null => {
  const counted = accountsByReach(accounts);
  return counted.length === 0 ? null : counted.reduce((sum, account) => sum + account.followerCount, 0);
};

/** Only pending applications still run the 72 h clock and can be decided. */
export const isPendingApplicant = (card: Pick<ApplicantCard, 'status'>): boolean =>
  card.status.key === 'submitted' || card.status.key === 'shortlisted';

/** The server tier key to the crest the badge draws; an unknown one (newer server) shows no crest. */
export const applicantTier = (tier: string | null): FollowerTierId | null =>
  FOLLOWER_TIERS.find(id => id === tier?.toUpperCase()) ?? null;

/** A linked account the platform vouched for (automatically or after review); anything else gets no badge. */
export const isVerifiedAccount = (account: Pick<ApplicantAccount, 'verificationStatus'>): boolean =>
  account.verificationStatus === 'auto_verified' || account.verificationStatus === 'approved';

/** Adding a pick when the tray is full changes nothing and says so (the screen answers with a nudge). */
export interface PickToggle {
  picks: SeatFace[];
  full: boolean;
}

/** Taps on the table: a picked applicant leaves the tray, a new one joins it until `max`. */
export const togglePick = (picks: readonly SeatFace[], pick: SeatFace, max: number): PickToggle => {
  if (picks.some(current => current.id === pick.id)) {
    return { picks: picks.filter(current => current.id !== pick.id), full: false };
  }
  if (picks.length >= max) return { picks: [...picks], full: true };
  return { picks: [...picks, pick], full: false };
};

/** The cards in the order the brand picked them, so the columns do not shuffle with the server; unknown ids drop out. */
export const orderByIds = (cards: readonly ApplicantCard[], ids: readonly string[]): ApplicantCard[] =>
  ids.flatMap(id => cards.find(card => card.id === id) ?? []);

/**
 * Which columns lead a compare row. Nothing leads when fewer than two columns have a figure or when
 * they all tie: a mark on every cell says nothing. Ties for the lead are all marked.
 */
export const bestIndexes = (values: readonly (number | null)[], prefer: 'min' | 'max'): number[] => {
  const known = values.filter((value): value is number => value !== null);
  if (known.length < 2) return [];
  const best = prefer === 'min' ? Math.min(...known) : Math.max(...known);
  if (known.every(value => value === best)) return [];
  return values.flatMap((value, index) => (value === best ? index : []));
};

/** The figures that can lead a compare row, and which way leads: the cheapest, the biggest reach, the best rated, the most deals. */
export const COMPARE_METRICS = {
  price: { prefer: 'min', value: card => card.price.gross.amount },
  followers: { prefer: 'max', value: card => totalFollowers(card.accounts) },
  // A rating with no reviews behind it is no figure: «new» does not lose to 4.6 from three people.
  rating: { prefer: 'max', value: card => (card.trackRecord.rating.count > 0 ? card.trackRecord.rating.average : null) },
  deals: { prefer: 'max', value: card => card.trackRecord.completedDeals },
} as const satisfies Record<string, { prefer: 'min' | 'max'; value: (card: ApplicantCard) => number | null }>;

export type CompareMetric = keyof typeof COMPARE_METRICS;

/** Columns (by index) that lead the metric across these cards. */
export const compareLeaders = (cards: readonly ApplicantCard[], metric: CompareMetric): number[] => {
  const { prefer, value } = COMPARE_METRICS[metric];
  return bestIndexes(cards.map(value), prefer);
};
