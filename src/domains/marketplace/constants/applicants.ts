import type { ParseKeys } from 'i18next';
import type { ApplicantCountKey, ApplicantSort } from '../types/campaign';

/** The three tabs of the applicants table; expired / rejected live in the status filter, not here. */
export const APPLICANT_TABS = ['new', 'shortlisted', 'selected'] as const;
export type ApplicantTab = (typeof APPLICANT_TABS)[number];

export const APPLICANT_TAB_DEF = {
  new: {
    status: 'submitted',
    label: 'marketplace.campaign.applicants.tabs.new',
    emptyTitle: 'marketplace.campaign.applicants.empty.new.title',
    emptyHint: 'marketplace.campaign.applicants.empty.new.hint',
  },
  shortlisted: {
    status: 'shortlisted',
    label: 'marketplace.campaign.applicants.tabs.shortlisted',
    emptyTitle: 'marketplace.campaign.applicants.empty.shortlisted.title',
    emptyHint: 'marketplace.campaign.applicants.empty.shortlisted.hint',
  },
  selected: {
    status: 'selected',
    label: 'marketplace.campaign.applicants.tabs.selected',
    emptyTitle: 'marketplace.campaign.applicants.empty.selected.title',
    emptyHint: 'marketplace.campaign.applicants.empty.selected.hint',
  },
} as const satisfies Record<
  ApplicantTab,
  {
    status: ApplicantCountKey;
    label: ParseKeys;
    emptyTitle: ParseKeys;
    emptyHint: ParseKeys;
  }
>;

/** Statuses the «Status» filter adds on top of the tabs (history of the campaign's applicants). */
export const APPLICANT_STATUS_FILTERS = ['expired', 'rejected', 'not_selected', 'cancelled'] as const satisfies readonly ApplicantCountKey[];
export type ApplicantStatusFilter = (typeof APPLICANT_STATUS_FILTERS)[number];

export const isApplicantStatusFilter = (value: string | null): value is ApplicantStatusFilter =>
  APPLICANT_STATUS_FILTERS.some(status => status === value);

export const APPLICANT_STATUS_FILTER_LABEL = {
  expired: 'marketplace.campaign.applicants.filters.status.expired',
  rejected: 'marketplace.campaign.applicants.filters.status.rejected',
  not_selected: 'marketplace.campaign.applicants.filters.status.notSelected',
  cancelled: 'marketplace.campaign.applicants.filters.status.cancelled',
} as const satisfies Record<ApplicantStatusFilter, ParseKeys>;

export const APPLICANT_SORT_LABEL = {
  newest: 'marketplace.campaign.applicants.sort.newest',
  oldest: 'marketplace.campaign.applicants.sort.oldest',
  expiring: 'marketplace.campaign.applicants.sort.expiring',
  price_asc: 'marketplace.campaign.applicants.sort.priceAsc',
  price_desc: 'marketplace.campaign.applicants.sort.priceDesc',
  followers: 'marketplace.campaign.applicants.sort.followers',
  rating: 'marketplace.campaign.applicants.sort.rating',
} as const satisfies Record<ApplicantSort, ParseKeys>;

/** «At least N followers» presets (the API takes one floor, no range). */
export const APPLICANT_FOLLOWER_FLOORS = [5_000, 10_000, 50_000, 100_000] as const;

/** An application expiring within this many hours is flagged warm on its card. */
export const APPLICANT_URGENT_HOURS = 6;

/** Seats beyond this many stop being drawn one by one on the table (a bar instead). */
export const APPLICANT_MAX_SEAT_SOCKETS = 5;

/** The contract takes 2–4 cards; the table compares at most 3 (approved PC3.0), so a face stays readable in a column. */
export const APPLICANT_COMPARE_MIN = 2;
export const APPLICANT_COMPARE_MAX = 3;
