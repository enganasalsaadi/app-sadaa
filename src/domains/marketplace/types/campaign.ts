import type { Money } from '@/core/money';
import type { DealFunding, DealShippingMode, DealStatus, Labeled, Timestamp } from './deal';

// Mirrors the backend Public Campaigns enums (`docs/public campaigns/public-campaigns.md` §2). Adding a
// value breaks every `Record<CampaignStatus, …>` map until it is handled; unknown values from a newer
// server map to `null` (the server `label` still renders).

export const CAMPAIGN_STATUS = [
  'draft',
  'pending_review',
  'changes_requested',
  'open',
  'suspended',
  'filled',
  'closed',
  'completed',
  'cancelled',
  'rejected',
  'removed',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const APPLICATION_STATUS = [
  'submitted',
  'shortlisted',
  'selected',
  'withdrawn',
  'expired',
  'rejected',
  'not_selected',
  'cancelled',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export const CAMPAIGN_PRICING_MODEL = ['fixed', 'bidding'] as const;
export type CampaignPricingModel = (typeof CAMPAIGN_PRICING_MODEL)[number];

export const CAMPAIGN_ACTIVITY_TYPE = [
  'ecommerce',
  'restaurant_cafe',
  'fashion_beauty',
  'tech_apps',
  'health_fitness',
  'events_entertainment',
  'retail_services',
  'other',
] as const;
export type CampaignActivityType = (typeof CAMPAIGN_ACTIVITY_TYPE)[number];

export const CAMPAIGN_GENDER = ['male', 'female'] as const;
export type CampaignGender = (typeof CAMPAIGN_GENDER)[number];

export const CAMPAIGN_FILE_PURPOSE = ['cover', 'brief'] as const;
export type CampaignFilePurpose = (typeof CAMPAIGN_FILE_PURPOSE)[number];

/** What the brand may do with a freed seat (`seat_freed.options`). */
export const CAMPAIGN_SEAT_FREED_OPTION = ['replace', 'reduce', 'reopen'] as const;
export type CampaignSeatFreedOption = (typeof CAMPAIGN_SEAT_FREED_OPTION)[number];

/** What the brand may do when the deadline passed with nobody applying (`zero_applicants.options`). */
export const CAMPAIGN_ZERO_APPLICANTS_OPTION = ['edit', 'extend', 'cancel'] as const;
export type CampaignZeroApplicantsOption = (typeof CAMPAIGN_ZERO_APPLICANTS_OPTION)[number];

/** Why Apply is disabled for the creator (`eligibility.reasons[].key`). */
export const CAMPAIGN_ELIGIBILITY_REASON = [
  'platform_missing',
  'min_followers',
  'gender_mismatch',
  'gender_required',
  'already_applied',
  'return_pending',
  'public_apply_ban',
] as const;
export type CampaignEligibilityReason = (typeof CAMPAIGN_ELIGIBILITY_REASON)[number];

export const CAMPAIGN_HISTORY_SUBJECT = ['campaign', 'application'] as const;
export type CampaignHistorySubject = (typeof CAMPAIGN_HISTORY_SUBJECT)[number];

/** Where an application's `state` comes from: the application itself, or the linked deal once selected. */
export const APPLICATION_STATE_SOURCE = ['deal', 'application'] as const;
export type ApplicationStateSource = (typeof APPLICATION_STATE_SOURCE)[number];

/** Applicant-list tab badges (`meta.counts`); `withdrawn` never reaches the brand. */
export const APPLICANT_COUNT_KEY = [
  'submitted',
  'shortlisted',
  'selected',
  'expired',
  'rejected',
  'not_selected',
  'cancelled',
] as const satisfies readonly ApplicationStatus[];
export type ApplicantCountKey = (typeof APPLICANT_COUNT_KEY)[number];

const isOneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): value is T =>
    typeof value === 'string' && (values as readonly string[]).includes(value);

export const isCampaignStatus = isOneOf(CAMPAIGN_STATUS);
export const isApplicationStatus = isOneOf(APPLICATION_STATUS);

/** An open-ended server key (platform, service, actor…) with its localized label. */
export interface CampaignLabel {
  key: string;
  label: string;
}

/** A filter option the server sends as `{ value, label }` (city, niche). */
export interface CampaignOption {
  value: string;
  label: string;
}

export interface CampaignPartyCard {
  slug: string | null;
  displayName: string;
  avatarUrl: string | null;
}

/** `gross − fee = net`, all from the server (rule 06); the creator headline is `net`. */
export interface CampaignMoneyBreakdown {
  gross: Money;
  fee: Money;
  net: Money;
}

export interface CampaignFile {
  id: string;
  purpose: CampaignFilePurpose | null;
  kind: string;
  name: string;
  mime: string;
  size: number;
  status: string;
  /** Short-lived signed link; `null` once purged. */
  url: string | null;
}

export interface CampaignPricing {
  model: Labeled<CampaignPricingModel>;
  /** Fixed model only. */
  seatPrice: Money | null;
  /** Bidding only; the max is binding, the min is a guide. */
  bidMin: Money | null;
  bidMax: Money | null;
  /** Optional total cap. */
  budget: Money | null;
}

export interface CampaignDeliverable {
  id: string;
  platform: CampaignLabel;
  service: CampaignLabel;
  count: number;
  revisions: number;
  addons: string[];
}

export interface CampaignTargeting {
  genders: CampaignGender[];
  minFollowers: number | null;
  /** Ranking only, never a gate. */
  cities: string[];
  niches: string[];
}

/** Derived synchronized-publish dates; present only when the campaign has a `dropAt`. */
export interface CampaignDropPlan {
  draftDueAt: Timestamp;
  publishOpensAt: Timestamp;
  minGapHours: number;
  latestApplyDeadlineAt: Timestamp;
}

export interface CampaignCounters {
  applicationsOpen: number;
  seatsOccupied: number;
}

/** The "a seat freed — decide" prompt; `null` on the campaign when there is nothing to decide. */
export interface CampaignSeatFreed {
  freeSeats: number;
  reducible: number;
  options: CampaignSeatFreedOption[];
  deadlinePassed: boolean;
}

export interface CampaignGhostTimer {
  warnsAt: Timestamp;
  suspendsAt: Timestamp;
}

export interface CampaignSuspensionTimer {
  /** Auto-cancel date; `null` when none is running. */
  endsAt: Timestamp | null;
  reopenNeedsDeadline: boolean;
}

export interface CampaignZeroApplicantsTimer {
  decideBy: Timestamp;
  extendAvailable: boolean;
  extendTo: Timestamp | null;
  options: CampaignZeroApplicantsOption[];
}

/** Running clocks behind the CM4 banners (detail only). */
export interface CampaignTimers {
  acceptingApplications: boolean;
  deadlinePassed: boolean;
  ghost: CampaignGhostTimer | null;
  suspension: CampaignSuspensionTimer | null;
  zeroApplicants: CampaignZeroApplicantsTimer | null;
}

/** Revealed to the creator only after funding. */
export interface CampaignPrivateBrief {
  hashtags: string[];
  mentions: string[];
  talkingPoints: string[];
  donts: string[];
  links: string[];
  promoCode: string | null;
  trackingLink: string | null;
}

/** Brand list row (`GET /brand/campaigns`): no private brief, attachments or timers. */
export interface Campaign {
  id: string;
  status: Labeled<CampaignStatus>;
  title: string;
  activityType: Labeled<CampaignActivityType> | null;
  /** Public requirements text creators see. */
  teaserRequirements: string | null;
  cover: CampaignFile | null;
  pricing: CampaignPricing;
  seatsTotal: number;
  shippingMode: Labeled<DealShippingMode>;
  /** `null` when the campaign has a drop. */
  deliveryDays: number | null;
  dropAt: Timestamp | null;
  drop: CampaignDropPlan | null;
  applyDeadlineAt: Timestamp | null;
  deliverables: CampaignDeliverable[];
  targeting: CampaignTargeting;
  budgetSecured: boolean;
  counters: CampaignCounters;
  seatFreed: CampaignSeatFreed | null;
  /** Admin note after `changes_requested` / `rejected` / `removed`. */
  reviewNote: string | null;
  duplicatedFromId: string | null;
  /** What blocks Submit (`title`, `teaser`, `pricing`…); empty when ready. */
  missing: string[];
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Brand detail; also the body of every campaign POST. */
export interface CampaignDetail extends Campaign {
  timers: CampaignTimers;
  privateBrief: CampaignPrivateBrief | null;
  attachments: CampaignFile[];
}

/** The brand's wallet against what the campaign needs (`/quote`, `/submit`). */
export interface CampaignWallet {
  balance: Money;
  required: Money;
  shortfall: Money;
  isSufficient: boolean;
}

/** `null` ends until the pricing is set. */
export interface CampaignQuote {
  pricingModel: CampaignPricingModel | null;
  feeBps: number;
  seats: number;
  deliverablesPerCreator: number;
  seat: { min: CampaignMoneyBreakdown | null; max: CampaignMoneyBreakdown | null };
  totalGross: { min: Money | null; max: Money | null };
  budget: Money | null;
  wallet: CampaignWallet;
}

/** Recruiting summary after Select and in the applicants meta. */
export interface CampaignRecruitingWallet {
  balance: Money;
  required: Money;
  shortfall: Money;
  coversOpenSeats: boolean;
}

export interface CampaignRecruiting {
  status: CampaignStatus | null;
  seatsTotal: number;
  seatsOccupied: number;
  seatsLeft: number;
  wallet: CampaignRecruitingWallet;
  budgetSecured: boolean;
  /** Open, seats left, ≥ 1 taken, wallet short: offer "Close recruiting now". */
  promptClose: boolean;
}

/** What Select could hold in escrow (same shape as a deal's funding block). */
export type CampaignFunding = DealFunding;

export interface CampaignHistoryRow {
  id: string;
  subject: { type: CampaignHistorySubject | null; id: string };
  /** Equal `from`/`to` keys are notes: render as events. */
  from: CampaignLabel | null;
  to: CampaignLabel;
  actor: CampaignLabel;
  reason: string | null;
  metadata: Record<string, unknown>;
  dueAt: Timestamp | null;
  occurredAt: Timestamp;
}

export interface CampaignEligibilityReasonRow {
  key: CampaignEligibilityReason | null;
  label: string;
  meta: Record<string, unknown>;
}

export interface CampaignEligibility {
  eligible: boolean;
  reasons: CampaignEligibilityReasonRow[];
}

export interface CreatorCampaignBrand {
  name: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface CreatorCampaignPricing {
  model: Labeled<CampaignPricingModel>;
  feeBps: number;
  fixed: CampaignMoneyBreakdown | null;
  bid: { min: CampaignMoneyBreakdown; max: CampaignMoneyBreakdown } | null;
}

export interface CreatorCampaignDeliverable {
  platform: CampaignLabel;
  service: CampaignLabel;
  count: number;
  revisions: number;
  addons: string[];
}

/** Creator feed card / saved row. */
export interface CreatorCampaign {
  id: string;
  status: Labeled<CampaignStatus>;
  /** The single flag that says "Apply is possible now". */
  acceptingApplications: boolean;
  title: string;
  activityType: Labeled<CampaignActivityType> | null;
  brand: CreatorCampaignBrand;
  cover: CampaignFile | null;
  pricing: CreatorCampaignPricing;
  seats: { total: number; left: number };
  applyDeadlineAt: Timestamp | null;
  dropAt: Timestamp | null;
  deliveryDays: number | null;
  shippingMode: Labeled<DealShippingMode>;
  deliverables: CreatorCampaignDeliverable[];
  bookmarked: boolean;
  invited: boolean;
  budgetSecured: boolean;
  eligibility: CampaignEligibility;
  publishedAt: Timestamp | null;
}

export interface CreatorCampaignRequirements {
  genders: CampaignGender[];
  minFollowers: number | null;
  cities: string[];
  niches: string[];
}

/** Teaser detail: public requirements only, never the private brief. */
export interface CreatorCampaignDetail extends CreatorCampaign {
  teaserRequirements: string | null;
  requirements: CreatorCampaignRequirements;
}

export interface ApplicantAccount {
  platform: CampaignLabel;
  username: string;
  followerCount: number | null;
  followerTier: string | null;
  verificationStatus: string;
  available: boolean;
}

export interface ApplicantCreator extends CampaignPartyCard {
  governorate: CampaignOption | null;
  niches: CampaignOption[];
  tier: string | null;
  tierLabel: string | null;
}

export interface ApplicantPrice {
  isBid: boolean;
  gross: Money;
  netToCreator: Money;
}

export interface CampaignDealRef {
  id: string;
  status: Labeled<DealStatus>;
}

export interface ApplicantActions {
  canShortlist: boolean;
  canReject: boolean;
  canSelect: boolean;
}

/** Brand view of an application: no phone, email, full name or area. */
export interface ApplicantCard {
  id: string;
  status: Labeled<ApplicationStatus>;
  invited: boolean;
  pitch: string | null;
  price: ApplicantPrice;
  accounts: ApplicantAccount[];
  creator: ApplicantCreator;
  trackRecord: { completedDeals: number; rating: { average: number | null; count: number } };
  termsHash: string;
  appliedAt: Timestamp;
  /** 72h from applying; shortlisting does not extend it. */
  expiresAt: Timestamp;
  decidedAt: Timestamp | null;
  deal: CampaignDealRef | null;
  actions: ApplicantActions;
}

/** What the application card shows: its own status while waiting, the linked deal's stage once selected. */
export interface CreatorApplicationState {
  /** Application status or deal stage; open-ended, so not narrowed. */
  key: string;
  label: string;
  source: ApplicationStateSource | null;
}

export interface CreatorApplicationCampaign {
  id: string;
  title: string;
  status: Labeled<CampaignStatus>;
  pricingModel: CampaignPricingModel | null;
  cover: CampaignFile | null;
  brand: { name: string; avatarUrl: string | null };
  applyDeadlineAt: Timestamp | null;
  dropAt: Timestamp | null;
}

export interface CreatorApplicationPrice {
  isBid: boolean;
  gross: Money;
  fee: Money;
  net: Money;
}

export interface CreatorApplication {
  id: string;
  status: Labeled<ApplicationStatus>;
  state: CreatorApplicationState;
  canWithdraw: boolean;
  pitch: string | null;
  price: CreatorApplicationPrice;
  accounts: { platform: CampaignLabel; username: string }[];
  termsHash: string;
  signedAt: Timestamp;
  expiresAt: Timestamp;
  decidedAt: Timestamp | null;
  campaign: CreatorApplicationCampaign;
  deal: CampaignDealRef | null;
  createdAt: Timestamp;
}

export interface CampaignPageMeta {
  currentPage: number;
  lastPage: number;
  total: number;
}

export interface CampaignPage<T> {
  items: T[];
  meta: CampaignPageMeta;
}

/** Applicants list: the page plus the tab badges and the recruiting summary. */
export interface ApplicantsPage extends CampaignPage<ApplicantCard> {
  counts: Record<ApplicantCountKey, number>;
  recruiting: CampaignRecruiting | null;
}

/** The two decisions that keep an application pending (selecting is its own flow); no reason is sent. */
export type ApplicantDecision = 'shortlist' | 'reject';

export interface ApplicantArgs {
  id: string;
  applicationId: string;
}

export interface ApplicantDecisionArgs extends ApplicantArgs {
  decision: ApplicantDecision;
}

/** Applicants list sorts (contract §3.5); `newest` is the server default. */
export const APPLICANT_SORT = [
  'newest',
  'oldest',
  'expiring',
  'price_asc',
  'price_desc',
  'followers',
  'rating',
] as const;
export type ApplicantSort = (typeof APPLICANT_SORT)[number];

/** What the brand narrows the applicants by; `status` replaces the tab's own status (expired, rejected…). */
export interface ApplicantFilters {
  sort: ApplicantSort;
  status: ApplicationStatus | null;
  governorates: string[];
  niches: string[];
  minFollowers: number | null;
  invitedOnly: boolean;
}

/** One applicants query: the tab's (or the status filter's) statuses plus the filters; the whole object is the cache key. */
export interface ApplicantsArgs extends Omit<ApplicantFilters, 'status'> {
  id: string;
  statuses: ApplicationStatus[];
}

/** Brand list tabs send the statuses of the group (`CAMPAIGN_TAB_STATUSES`). */
export interface CampaignListArgs {
  statuses?: CampaignStatus[];
}

/** Server-side feed filters only; the API has no platform / price / shipping filters (plan §0). */
export interface CreatorFeedArgs {
  activityTypes?: CampaignActivityType[];
  pricingModel?: CampaignPricingModel | null;
}

export interface CreatorApplicationsArgs {
  statuses?: ApplicationStatus[];
}

/** Lifecycle actions answering the full campaign (contract §3.3), relative to `/brand/campaigns/{id}`. */
export type CampaignActionPath =
  | 'submit'
  | 'seats'
  | 'seats/reopen'
  | 'seats/reduce'
  | 'deadline'
  | 'reopen'
  | 'zero-applicants/extend'
  | 'cancel'
  | 'close'
  | 'duplicate';

/** Wire body of a lifecycle action: `seats` is a count, the deadline an ISO time with offset. */
export interface CampaignActionBody {
  seats?: number;
  apply_deadline_at?: string;
  reason?: string;
}

export interface CampaignActionRequest {
  body?: CampaignActionBody;
}

export interface CampaignActionArgs extends CampaignActionRequest {
  id: string;
  path: CampaignActionPath;
  idempotencyKey?: string;
}

/** `wallet` only comes with `submit` (low balance = a warning banner, never a block). */
export interface CampaignActionResult {
  campaign: CampaignDetail;
  wallet: CampaignWallet | null;
}
