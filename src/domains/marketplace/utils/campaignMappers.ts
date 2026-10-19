import { parseUsd, parseUsdOrNull } from '@/core/money';
import {
  APPLICANT_COUNT_KEY,
  APPLICATION_STATE_SOURCE,
  APPLICATION_STATUS,
  CAMPAIGN_ACTIVITY_TYPE,
  CAMPAIGN_ELIGIBILITY_REASON,
  CAMPAIGN_FILE_PURPOSE,
  CAMPAIGN_GENDER,
  CAMPAIGN_INVITE_SKIP,
  CAMPAIGN_HISTORY_SUBJECT,
  CAMPAIGN_PRICING_MODEL,
  CAMPAIGN_SEAT_FREED_OPTION,
  CAMPAIGN_STATUS,
  CAMPAIGN_ZERO_APPLICANTS_OPTION,
  type ApplicantAccount,
  type ApplicantCard,
  type ApplicantsPage,
  type Campaign,
  type CampaignDeliverable,
  type CampaignDealRef,
  type CampaignActionResult,
  type CampaignDetail,
  type CampaignDropPlan,
  type CampaignEligibility,
  type CampaignFile,
  type CampaignFunding,
  type CampaignHistoryRow,
  type CampaignLabel,
  type CampaignMoneyBreakdown,
  type CampaignOption,
  type CampaignPage,
  type CampaignPricing,
  type CampaignPrivateBrief,
  type CampaignQuote,
  type CampaignRecruiting,
  type CampaignSelectResult,
  type CampaignSeatFreed,
  type CampaignStatus,
  type CampaignTargeting,
  type CampaignTimers,
  type CampaignWallet,
  type CreatorApplication,
  type CreatorCampaign,
  type CampaignInviteReport,
  type CreatorCampaignDeliverable,
  type CreatorCampaignDetail,
  type CreatorCampaignPricing,
} from '../types/campaign';
import type {
  ApplicantAccountDto,
  ApplicantCardDto,
  ApplicantsPageDto,
  CampaignDealRefDto,
  CampaignDeliverableDto,
  CampaignActionDataDto,
  CampaignActionMetaDto,
  CampaignDetailDto,
  CampaignInviteReportDto,
  CampaignDropPlanDto,
  CampaignDto,
  CampaignEligibilityDto,
  CampaignFileDto,
  CampaignFundingDto,
  CampaignHistoryRowDto,
  CampaignMoneyBreakdownDto,
  CampaignOptionDto,
  CampaignPageDto,
  CampaignPricingDto,
  CampaignPrivateBriefDto,
  CampaignQuoteDto,
  CampaignRecruitingDto,
  CampaignSeatFreedDto,
  CampaignSelectDto,
  CampaignTargetingDto,
  CampaignTimersDto,
  CampaignQuoteWalletDto,
  CampaignWalletDto,
  CreatorApplicationDto,
  CreatorCampaignDeliverableDto,
  CreatorCampaignDetailDto,
  CreatorCampaignDto,
  CreatorCampaignPricingDto,
} from '../types/campaignDto';
import { DEAL_SHIPPING_MODE, DEAL_STATUS } from '../types/deal';
import type { DealLabeledDto } from '../types/dealDto';
import { mapDealFunding, oneOf, toLabeled, toLabeledOrNull, toTimestamp, toTimestampOrNull } from './dealMappers';

// DTO → domain for every Public Campaigns resource (rule 04). Same stance as the deal mappers: unknown
// enum values become `null` (labels still render); malformed money or required timestamps throw.

const oneOfList = <T extends string>(values: readonly T[], list: readonly string[]): T[] =>
  list.flatMap(value => {
    const known = oneOf(values, value);
    return known === null ? [] : [known];
  });

const toLabel = ({ key, label }: DealLabeledDto): CampaignLabel => ({ key, label });

const toOption = ({ value, label }: CampaignOptionDto): CampaignOption => ({ value, label });

const toBreakdown = (dto: CampaignMoneyBreakdownDto): CampaignMoneyBreakdown => ({
  gross: parseUsd(dto.gross_usd),
  fee: parseUsd(dto.fee_usd),
  net: parseUsd(dto.net_usd),
});

export const mapCampaignFile = (dto: CampaignFileDto): CampaignFile => ({
  id: dto.id,
  purpose: oneOf(CAMPAIGN_FILE_PURPOSE, dto.purpose),
  kind: dto.kind,
  name: dto.name,
  mime: dto.mime,
  size: dto.size,
  status: dto.status,
  url: dto.url,
});

const mapPricing = (dto: CampaignPricingDto): CampaignPricing => ({
  model: toLabeled(CAMPAIGN_PRICING_MODEL, dto.model),
  seatPrice: parseUsdOrNull(dto.seat_price_usd),
  bidMin: parseUsdOrNull(dto.bid_min_usd),
  bidMax: parseUsdOrNull(dto.bid_max_usd),
  budget: parseUsdOrNull(dto.budget_usd),
});

const mapDeliverable = (dto: CampaignDeliverableDto): CampaignDeliverable => ({
  id: dto.id,
  platform: toLabel(dto.platform),
  service: toLabel(dto.service),
  count: dto.count,
  revisions: dto.revisions,
  addons: dto.addons,
});

const mapTargeting = (dto: CampaignTargetingDto): CampaignTargeting => ({
  genders: oneOfList(CAMPAIGN_GENDER, dto.genders),
  minFollowers: dto.min_followers,
  cities: dto.cities,
  niches: dto.niches,
});

const mapDropPlan = (dto: CampaignDropPlanDto): CampaignDropPlan => ({
  draftDueAt: toTimestamp(dto.draft_due_at),
  publishOpensAt: toTimestamp(dto.publish_opens_at),
  minGapHours: dto.min_gap_hours,
  latestApplyDeadlineAt: toTimestamp(dto.latest_apply_deadline_at),
});

const mapSeatFreed = (dto: CampaignSeatFreedDto): CampaignSeatFreed => ({
  freeSeats: dto.free_seats,
  reducible: dto.reducible,
  options: oneOfList(CAMPAIGN_SEAT_FREED_OPTION, dto.options),
  deadlinePassed: dto.deadline_passed,
});

export const mapCampaign = (dto: CampaignDto): Campaign => ({
  id: dto.id,
  status: toLabeled(CAMPAIGN_STATUS, dto.status),
  title: dto.title,
  activityType: toLabeledOrNull(CAMPAIGN_ACTIVITY_TYPE, dto.activity_type),
  teaserRequirements: dto.teaser?.requirements ?? null,
  cover: dto.cover ? mapCampaignFile(dto.cover) : null,
  pricing: mapPricing(dto.pricing),
  seatsTotal: dto.seats_total,
  shippingMode: toLabeled(DEAL_SHIPPING_MODE, dto.shipping_mode),
  deliveryDays: dto.delivery_days,
  dropAt: toTimestampOrNull(dto.drop_at),
  drop: dto.drop ? mapDropPlan(dto.drop) : null,
  applyDeadlineAt: toTimestampOrNull(dto.apply_deadline_at),
  deliverables: dto.deliverables.map(mapDeliverable),
  targeting: mapTargeting(dto.targeting),
  budgetSecured: dto.budget_secured,
  counters: {
    applicationsOpen: dto.counters.applications_open,
    seatsOccupied: dto.counters.seats_occupied,
  },
  seatFreed: dto.seat_freed ? mapSeatFreed(dto.seat_freed) : null,
  reviewNote: dto.review_note,
  duplicatedFromId: dto.duplicated_from_id,
  missing: dto.missing,
  publishedAt: toTimestampOrNull(dto.published_at),
  createdAt: toTimestamp(dto.created_at),
  updatedAt: toTimestamp(dto.updated_at),
});

const mapTimers = (dto: CampaignTimersDto): CampaignTimers => ({
  acceptingApplications: dto.accepting_applications,
  deadlinePassed: dto.deadline_passed,
  ghost: dto.ghost
    ? { warnsAt: toTimestamp(dto.ghost.warns_at), suspendsAt: toTimestamp(dto.ghost.suspends_at) }
    : null,
  suspension: dto.suspension
    ? {
        endsAt: toTimestampOrNull(dto.suspension.ends_at),
        reopenNeedsDeadline: dto.suspension.reopen_needs_deadline,
      }
    : null,
  zeroApplicants: dto.zero_applicants
    ? {
        decideBy: toTimestamp(dto.zero_applicants.decide_by),
        extendAvailable: dto.zero_applicants.extend_available,
        extendTo: toTimestampOrNull(dto.zero_applicants.extend_to),
        options: oneOfList(CAMPAIGN_ZERO_APPLICANTS_OPTION, dto.zero_applicants.options),
      }
    : null,
});

const mapPrivateBrief = (dto: CampaignPrivateBriefDto): CampaignPrivateBrief => ({
  hashtags: dto.hashtags,
  mentions: dto.mentions,
  talkingPoints: dto.talking_points,
  donts: dto.donts,
  links: dto.links,
  promoCode: dto.promo_code,
  trackingLink: dto.tracking_link,
});

/** Detail and the body of every campaign POST (full `CampaignResource`). */
export const mapCampaignDetail = (dto: CampaignDetailDto): CampaignDetail => ({
  ...mapCampaign(dto),
  timers: mapTimers(dto.timers),
  privateBrief: dto.private_brief ? mapPrivateBrief(dto.private_brief) : null,
  attachments: dto.attachments.map(mapCampaignFile),
});

const mapWallet = (dto: CampaignWalletDto): CampaignWallet => ({
  balance: parseUsd(dto.balance_usd),
  required: parseUsd(dto.required_usd),
  shortfall: parseUsd(dto.shortfall_usd),
  isSufficient: dto.is_sufficient,
});

/** `/quote`'s wallet block. */
export const mapCampaignWallet = mapWallet;

/** `submit` is the only action that adds a wallet check; it sits beside the campaign (`data` or `meta`). */
export const mapCampaignActionResult = (
  data: CampaignActionDataDto,
  meta?: CampaignActionMetaDto,
): CampaignActionResult => {
  const wallet = meta?.wallet ?? data.wallet;
  return { campaign: mapCampaignDetail(data), wallet: wallet ? mapWallet(wallet) : null };
};

/** Nothing to hold yet (no pricing) reads as covered: zero required, zero short. */
const mapQuoteWallet = (dto: CampaignQuoteWalletDto): CampaignWallet => {
  const zero = parseUsd('0');
  const shortfall = parseUsdOrNull(dto.shortfall_usd) ?? zero;
  return {
    balance: parseUsdOrNull(dto.balance_usd) ?? zero,
    required: parseUsdOrNull(dto.required_usd) ?? zero,
    shortfall,
    isSufficient: dto.is_sufficient ?? shortfall.amount === 0,
  };
};

export const mapCampaignQuote = (dto: CampaignQuoteDto): CampaignQuote => ({
  pricingModel: oneOf(CAMPAIGN_PRICING_MODEL, dto.pricing_model),
  feeBps: dto.fee_bps,
  seats: dto.seats,
  deliverablesPerCreator: dto.deliverables_per_creator,
  seat: {
    min: dto.seat.min ? toBreakdown(dto.seat.min) : null,
    max: dto.seat.max ? toBreakdown(dto.seat.max) : null,
  },
  totalGross: {
    min: parseUsdOrNull(dto.total_gross_usd.min),
    max: parseUsdOrNull(dto.total_gross_usd.max),
  },
  budget: parseUsdOrNull(dto.budget_usd),
  wallet: mapQuoteWallet(dto.wallet),
});

const toStatusKey = (status: CampaignRecruitingDto['status']): CampaignStatus | null =>
  oneOf(CAMPAIGN_STATUS, typeof status === 'string' ? status : status.key);

export const mapCampaignRecruiting = (dto: CampaignRecruitingDto): CampaignRecruiting => ({
  status: toStatusKey(dto.status),
  seatsTotal: dto.seats_total,
  seatsOccupied: dto.seats_occupied,
  seatsLeft: dto.seats_left,
  wallet: {
    balance: parseUsd(dto.wallet.balance_usd),
    required: parseUsd(dto.wallet.required_usd),
    shortfall: parseUsd(dto.wallet.shortfall_usd),
    coversOpenSeats: dto.wallet.covers_open_seats,
  },
  budgetSecured: dto.budget_secured,
  promptClose: dto.prompt_close,
});

export const mapCampaignFunding = (dto: CampaignFundingDto): CampaignFunding => mapDealFunding(dto);

export const mapCampaignHistoryRow = (dto: CampaignHistoryRowDto): CampaignHistoryRow => ({
  id: dto.id,
  subject: { type: oneOf(CAMPAIGN_HISTORY_SUBJECT, dto.subject.type), id: dto.subject.id },
  from: dto.from ? toLabel(dto.from) : null,
  to: toLabel(dto.to),
  actor: toLabel(dto.actor),
  reason: dto.reason,
  metadata: dto.metadata ?? {},
  dueAt: toTimestampOrNull(dto.due_at),
  occurredAt: toTimestamp(dto.occurred_at),
});

const mapEligibility = (dto: CampaignEligibilityDto): CampaignEligibility => ({
  eligible: dto.eligible,
  reasons: dto.reasons.map(reason => ({
    key: oneOf(CAMPAIGN_ELIGIBILITY_REASON, reason.key),
    label: reason.label,
    meta: reason.meta ?? {},
  })),
});

const mapCreatorPricing = (dto: CreatorCampaignPricingDto): CreatorCampaignPricing => ({
  model: toLabeled(CAMPAIGN_PRICING_MODEL, dto.model),
  feeBps: dto.fee_bps,
  fixed: dto.fixed ? toBreakdown(dto.fixed) : null,
  bid: dto.bid ? { min: toBreakdown(dto.bid.min), max: toBreakdown(dto.bid.max) } : null,
});

const mapCreatorDeliverable = (dto: CreatorCampaignDeliverableDto): CreatorCampaignDeliverable => ({
  platform: toLabel(dto.platform),
  service: toLabel(dto.service),
  count: dto.count,
  revisions: dto.revisions,
  addons: dto.addons,
});

/** The wire says `left`; the RTL lint bans that word as a property name, so the key is read from a constant. */
const SEATS_FREE_KEY = 'left';

export const mapCreatorCampaign = (dto: CreatorCampaignDto): CreatorCampaign => ({
  id: dto.id,
  status: toLabeled(CAMPAIGN_STATUS, dto.status),
  acceptingApplications: dto.accepting_applications,
  title: dto.title,
  activityType: toLabeledOrNull(CAMPAIGN_ACTIVITY_TYPE, dto.activity_type),
  brand: { name: dto.brand.name, avatarUrl: dto.brand.avatar_url, verified: dto.brand.verified },
  cover: dto.cover ? mapCampaignFile(dto.cover) : null,
  pricing: mapCreatorPricing(dto.pricing),
  seats: { total: dto.seats.total, free: dto.seats[SEATS_FREE_KEY] },
  applyDeadlineAt: toTimestampOrNull(dto.apply_deadline_at),
  dropAt: toTimestampOrNull(dto.drop_at),
  deliveryDays: dto.delivery_days,
  shippingMode: toLabeled(DEAL_SHIPPING_MODE, dto.shipping_mode),
  deliverables: dto.deliverables.map(mapCreatorDeliverable),
  bookmarked: dto.bookmarked,
  invited: dto.invited,
  budgetSecured: dto.budget_secured,
  eligibility: mapEligibility(dto.eligibility),
  publishedAt: toTimestampOrNull(dto.published_at),
});

export const mapCreatorCampaignDetail = (dto: CreatorCampaignDetailDto): CreatorCampaignDetail => ({
  ...mapCreatorCampaign(dto),
  teaserRequirements: dto.teaser?.requirements ?? null,
  requirements: {
    genders: oneOfList(CAMPAIGN_GENDER, dto.requirements.genders),
    minFollowers: dto.requirements.min_followers,
    cities: dto.requirements.cities,
    niches: dto.requirements.niches,
  },
});

const mapDealRef = (dto: CampaignDealRefDto): CampaignDealRef => ({
  id: dto.id,
  status: toLabeled(DEAL_STATUS, dto.status),
});

const mapApplicantAccount = (dto: ApplicantAccountDto): ApplicantAccount => ({
  platform: toLabel(dto.platform),
  username: dto.username,
  followerCount: dto.follower_count,
  followerTier: dto.follower_tier,
  verificationStatus: dto.verification_status,
  available: dto.available,
});

export const mapApplicantCard = (dto: ApplicantCardDto): ApplicantCard => ({
  id: dto.id,
  status: toLabeled(APPLICATION_STATUS, dto.status),
  invited: dto.invited,
  pitch: dto.pitch,
  price: {
    isBid: dto.price.is_bid,
    gross: parseUsd(dto.price.gross_usd),
    netToCreator: parseUsd(dto.price.net_to_creator_usd),
  },
  accounts: dto.accounts.map(mapApplicantAccount),
  creator: {
    slug: dto.creator.slug,
    displayName: dto.creator.display_name,
    avatarUrl: dto.creator.avatar_url,
    governorate: dto.creator.governorate ? toOption(dto.creator.governorate) : null,
    niches: dto.creator.niches.map(toOption),
    tier: dto.creator.tier,
    tierLabel: dto.creator.tier_label,
  },
  trackRecord: {
    completedDeals: dto.track_record.completed_deals,
    rating: dto.track_record.rating,
  },
  termsHash: dto.terms_hash,
  appliedAt: toTimestamp(dto.applied_at),
  expiresAt: toTimestamp(dto.expires_at),
  decidedAt: toTimestampOrNull(dto.decided_at),
  deal: dto.deal ? mapDealRef(dto.deal) : null,
  actions: {
    canShortlist: dto.actions.can_shortlist,
    canReject: dto.actions.can_reject,
    canSelect: dto.actions.can_select,
  },
});

export const mapCampaignSelectResult = (dto: CampaignSelectDto): CampaignSelectResult => ({
  application: mapApplicantCard(dto.application),
  deal: mapDealRef(dto.deal),
  funding: mapCampaignFunding(dto.funding),
  recruiting: mapCampaignRecruiting(dto.recruiting),
});

export const mapCampaignInviteReport = (dto: CampaignInviteReportDto): CampaignInviteReport => ({
  rows: dto.results.map(row => {
    const named = typeof row.creator === 'string' ? null : row.creator;
    return {
      slug: named?.slug ?? (row.creator as string),
      displayName: named?.display_name ?? null,
      invited: row.invited,
      reason: row.reason ? toLabeled(CAMPAIGN_INVITE_SKIP, row.reason) : null,
      eligibility: (row.eligibility ?? []).map(item => item.label),
    };
  }),
  invited: dto.invited,
  skipped: dto.skipped,
  limit: dto.limit,
  used: dto.used,
});

export const mapCreatorApplication = (dto: CreatorApplicationDto): CreatorApplication => ({
  id: dto.id,
  status: toLabeled(APPLICATION_STATUS, dto.status),
  state: {
    key: dto.state.key,
    label: dto.state.label,
    source: oneOf(APPLICATION_STATE_SOURCE, dto.state.source),
  },
  canWithdraw: dto.can_withdraw,
  pitch: dto.pitch,
  price: {
    isBid: dto.price.is_bid,
    gross: parseUsd(dto.price.gross_usd),
    fee: parseUsd(dto.price.fee_usd),
    net: parseUsd(dto.price.net_usd),
  },
  accounts: dto.accounts.map(account => ({ platform: toLabel(account.platform), username: account.username })),
  termsHash: dto.terms_hash,
  signedAt: toTimestamp(dto.signed_at),
  expiresAt: toTimestamp(dto.expires_at),
  decidedAt: toTimestampOrNull(dto.decided_at),
  campaign: {
    id: dto.campaign.id,
    title: dto.campaign.title,
    status: toLabeled(CAMPAIGN_STATUS, dto.campaign.status),
    pricingModel: oneOf(CAMPAIGN_PRICING_MODEL, dto.campaign.pricing_model),
    cover: dto.campaign.cover ? mapCampaignFile(dto.campaign.cover) : null,
    brand: { name: dto.campaign.brand.name, avatarUrl: dto.campaign.brand.avatar_url },
    applyDeadlineAt: toTimestampOrNull(dto.campaign.apply_deadline_at),
    dropAt: toTimestampOrNull(dto.campaign.drop_at),
  },
  deal: dto.deal ? mapDealRef(dto.deal) : null,
  createdAt: toTimestamp(dto.created_at),
});

const mapPage = <D, T>({ items, meta }: CampaignPageDto<D>, map: (dto: D) => T): CampaignPage<T> => ({
  items: items.map(map),
  meta: { currentPage: meta.current_page, lastPage: meta.last_page, total: meta.total },
});

export const mapCampaignsPage = (page: CampaignPageDto<CampaignDto>): CampaignPage<Campaign> =>
  mapPage(page, mapCampaign);

export const mapCreatorCampaignsPage = (
  page: CampaignPageDto<CreatorCampaignDto>,
): CampaignPage<CreatorCampaign> => mapPage(page, mapCreatorCampaign);

export const mapCreatorApplicationsPage = (
  page: CampaignPageDto<CreatorApplicationDto>,
): CampaignPage<CreatorApplication> => mapPage(page, mapCreatorApplication);

export const mapApplicantsPage = (page: ApplicantsPageDto): ApplicantsPage => ({
  ...mapPage(page, mapApplicantCard),
  counts: Object.fromEntries(
    APPLICANT_COUNT_KEY.map(key => [key, page.meta.counts?.[key] ?? 0]),
  ) as ApplicantsPage['counts'],
  recruiting: page.meta.recruiting ? mapCampaignRecruiting(page.meta.recruiting) : null,
});
