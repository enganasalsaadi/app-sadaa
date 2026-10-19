import type { DealFundingDto, DealLabeledDto } from './dealDto';

// Wire shapes of the backend Public Campaigns resources (`docs/public campaigns/public-campaigns.md`
// §3–4), snake_case as sent. Enum keys stay `string`: a newer server may send values this build doesn't
// know (mappers narrow them). Money is a USD string (`"150.00"`); times are ISO 8601 with offset.

export interface CampaignFileDto {
  id: string;
  purpose: string;
  kind: string;
  name: string;
  mime: string;
  size: number;
  sha256: string | null;
  status: string;
  url: string | null;
}

export interface CampaignMoneyBreakdownDto {
  gross_usd: string;
  fee_usd: string;
  net_usd: string;
}

export interface CampaignPricingDto {
  model: DealLabeledDto;
  seat_price_usd: string | null;
  bid_min_usd: string | null;
  bid_max_usd: string | null;
  budget_usd: string | null;
}

export interface CampaignDeliverableDto {
  id: string;
  platform: DealLabeledDto;
  service: DealLabeledDto;
  count: number;
  revisions: number;
  addons: string[];
}

export interface CampaignTargetingDto {
  genders: string[];
  min_followers: number | null;
  cities: string[];
  niches: string[];
}

export interface CampaignDropPlanDto {
  draft_due_at: string;
  publish_opens_at: string;
  min_gap_hours: number;
  latest_apply_deadline_at: string;
}

export interface CampaignSeatFreedDto {
  free_seats: number;
  reducible: number;
  options: string[];
  deadline_passed: boolean;
}

export interface CampaignTimersDto {
  accepting_applications: boolean;
  deadline_passed: boolean;
  ghost: { warns_at: string; suspends_at: string } | null;
  suspension: { ends_at: string | null; reopen_needs_deadline: boolean } | null;
  zero_applicants: {
    decide_by: string;
    extend_available: boolean;
    extend_to: string | null;
    options: string[];
  } | null;
}

export interface CampaignPrivateBriefDto {
  hashtags: string[];
  mentions: string[];
  talking_points: string[];
  donts: string[];
  links: string[];
  promo_code: string | null;
  tracking_link: string | null;
}

/** `CampaignResource` list row; the detail adds `timers`, `private_brief` and `attachments`. */
export interface CampaignDto {
  id: string;
  status: DealLabeledDto;
  title: string;
  activity_type: DealLabeledDto | null;
  teaser: { requirements: string | null } | null;
  cover: CampaignFileDto | null;
  pricing: CampaignPricingDto;
  seats_total: number;
  shipping_mode: DealLabeledDto;
  delivery_days: number | null;
  drop_at: string | null;
  drop: CampaignDropPlanDto | null;
  apply_deadline_at: string | null;
  deliverables: CampaignDeliverableDto[];
  targeting: CampaignTargetingDto;
  budget_secured: boolean;
  counters: { applications_open: number; seats_occupied: number };
  seat_freed: CampaignSeatFreedDto | null;
  review_note: string | null;
  duplicated_from_id: string | null;
  missing: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignDetailDto extends CampaignDto {
  timers: CampaignTimersDto;
  private_brief: CampaignPrivateBriefDto | null;
  attachments: CampaignFileDto[];
}

export interface CampaignWalletDto {
  balance_usd: string;
  required_usd: string;
  shortfall_usd: string;
  is_sufficient: boolean;
}

/** The quote's wallet block: until the pricing is set the server has nothing to hold, so these arrive `null`. */
export interface CampaignQuoteWalletDto {
  balance_usd: string | null;
  required_usd: string | null;
  shortfall_usd: string | null;
  is_sufficient: boolean | null;
}

export interface CampaignQuoteDto {
  pricing_model: string | null;
  currency: string;
  fee_bps: number;
  seats: number;
  deliverables_per_creator: number;
  seat: { min: CampaignMoneyBreakdownDto | null; max: CampaignMoneyBreakdownDto | null };
  total_gross_usd: { min: string | null; max: string | null };
  budget_usd: string | null;
  wallet: CampaignQuoteWalletDto;
}

export interface CampaignRecruitingDto {
  /** Documented as a bare `status`; accept both the key and the `{ key, label }` object. */
  status: string | DealLabeledDto;
  seats_total: number;
  seats_occupied: number;
  seats_left: number;
  wallet: {
    balance_usd: string;
    required_usd: string;
    shortfall_usd: string;
    covers_open_seats: boolean;
  };
  budget_secured: boolean;
  prompt_close: boolean;
}

export type CampaignFundingDto = DealFundingDto;

export interface CampaignHistoryRowDto {
  id: string;
  subject: { type: string; id: string };
  from: DealLabeledDto | null;
  to: DealLabeledDto;
  actor: DealLabeledDto;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  due_at: string | null;
  occurred_at: string;
}

export interface CampaignEligibilityDto {
  eligible: boolean;
  reasons: { key: string; label: string; meta?: Record<string, unknown> | null }[];
}

export interface CreatorCampaignPricingDto {
  model: DealLabeledDto;
  fee_bps: number;
  fixed: CampaignMoneyBreakdownDto | null;
  bid: { min: CampaignMoneyBreakdownDto; max: CampaignMoneyBreakdownDto } | null;
}

export interface CreatorCampaignDeliverableDto {
  platform: DealLabeledDto;
  service: DealLabeledDto;
  count: number;
  revisions: number;
  addons: string[];
}

/** `CreatorCampaignResource` card; the detail adds `teaser` and `requirements`. */
export interface CreatorCampaignDto {
  id: string;
  status: DealLabeledDto;
  accepting_applications: boolean;
  title: string;
  activity_type: DealLabeledDto | null;
  brand: { name: string; avatar_url: string | null; verified: boolean };
  cover: CampaignFileDto | null;
  pricing: CreatorCampaignPricingDto;
  seats: { total: number; left: number };
  apply_deadline_at: string | null;
  drop_at: string | null;
  delivery_days: number | null;
  shipping_mode: DealLabeledDto;
  deliverables: CreatorCampaignDeliverableDto[];
  bookmarked: boolean;
  invited: boolean;
  budget_secured: boolean;
  eligibility: CampaignEligibilityDto;
  published_at: string | null;
}

export interface CreatorCampaignDetailDto extends CreatorCampaignDto {
  teaser: { requirements: string | null } | null;
  requirements: {
    genders: string[];
    min_followers: number | null;
    cities: string[];
    niches: string[];
  };
}

export interface CampaignOptionDto {
  value: string;
  label: string;
}

export interface ApplicantAccountDto {
  platform: DealLabeledDto;
  username: string;
  follower_count: number | null;
  follower_tier: string | null;
  verification_status: string;
  available: boolean;
}

export interface CampaignDealRefDto {
  id: string;
  status: DealLabeledDto;
}

export interface ApplicantCardDto {
  id: string;
  status: DealLabeledDto;
  invited: boolean;
  pitch: string | null;
  price: { is_bid: boolean; gross_usd: string; net_to_creator_usd: string };
  accounts: ApplicantAccountDto[];
  creator: {
    slug: string | null;
    display_name: string;
    avatar_url: string | null;
    governorate: CampaignOptionDto | null;
    niches: CampaignOptionDto[];
    tier: string | null;
    tier_label: string | null;
  };
  track_record: { completed_deals: number; rating: { average: number | null; count: number } };
  terms_hash: string;
  applied_at: string;
  expires_at: string;
  decided_at: string | null;
  deal: CampaignDealRefDto | null;
  actions: { can_shortlist: boolean; can_reject: boolean; can_select: boolean };
}

export interface CreatorApplicationDto {
  id: string;
  status: DealLabeledDto;
  state: { key: string; label: string; source: string };
  can_withdraw: boolean;
  pitch: string | null;
  price: { is_bid: boolean; gross_usd: string; fee_usd: string; net_usd: string };
  accounts: { platform: DealLabeledDto; username: string }[];
  terms_hash: string;
  signed_at: string;
  expires_at: string;
  decided_at: string | null;
  campaign: {
    id: string;
    title: string;
    status: DealLabeledDto;
    pricing_model: string;
    cover: CampaignFileDto | null;
    brand: { name: string; avatar_url: string | null };
    apply_deadline_at: string | null;
    drop_at: string | null;
  };
  deal: CampaignDealRefDto | null;
  created_at: string;
}

/** Paged lists put `{ items, meta }` in `data`; the applicants list adds `counts` and `recruiting` to `meta`. */
export interface CampaignPageDto<T> {
  items: T[];
  meta: { current_page: number; last_page: number; total: number };
}

/** `POST …/applications/{app}/select` → 201 (contract §3.5). */
export interface CampaignSelectDto {
  application: ApplicantCardDto;
  deal: CampaignDealRefDto;
  funding: CampaignFundingDto;
  recruiting: CampaignRecruitingDto;
}

/** One creator of a `POST …/invitations` report (contract §3.6); `creator` is the explore slug. */
export interface CampaignInviteRowDto {
  creator: string | { slug: string; display_name?: string | null };
  invited: boolean;
  reason: DealLabeledDto | null;
  eligibility: DealLabeledDto[] | null;
}

export interface CampaignInviteReportDto {
  results: CampaignInviteRowDto[];
  invited: number;
  skipped: number;
  limit: number;
  used: number;
}

export interface ApplicantsPageDto extends CampaignPageDto<ApplicantCardDto> {
  meta: CampaignPageDto<ApplicantCardDto>['meta'] & {
    counts?: Partial<Record<string, number>>;
    recruiting?: CampaignRecruitingDto | null;
  };
}

/** `submit` adds the wallet check; the contract says "campaign + wallet", so accept it in `data` or `meta`. */
export interface CampaignActionDataDto extends CampaignDetailDto {
  wallet?: CampaignWalletDto | null;
}

export interface CampaignActionMetaDto {
  wallet?: CampaignWalletDto | null;
}
