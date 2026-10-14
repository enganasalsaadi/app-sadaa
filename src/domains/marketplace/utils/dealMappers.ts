import { parseUsd, parseUsdOrNull } from '@/core/money';
import {
  BRAND_DEAL_ACTION,
  DEAL_ACTOR,
  DEAL_CANCEL_OUTCOME,
  DEAL_DECLINE_REASON,
  DEAL_DISPUTE_OUTCOME,
  DEAL_DISPUTE_REASON,
  DEAL_DISPUTE_STATUS,
  DEAL_DRAFT_DECISION,
  DEAL_FILE_KIND,
  DEAL_FILE_PURPOSE,
  DEAL_FILE_STATUS,
  DEAL_ITEM_STATUS,
  DEAL_PUBLICATION_DECISION,
  DEAL_RATING_CRITERIA,
  DEAL_RETENTION_ESCALATION,
  DEAL_RETENTION_REASON,
  DEAL_RETENTION_STATUS,
  DEAL_RETENTION_TERM,
  DEAL_SHIPPING_ISSUE_REASON,
  DEAL_SHIPPING_MODE,
  DEAL_STATUS,
  DEAL_STRIKE_REASON,
  DEAL_UPSELL_DECLINE_REASON,
  DEAL_UPSELL_KIND,
  DEAL_UPSELL_STATUS,
  type BrandActiveDeal,
  type Deal,
  type DealAddendum,
  type DealAddon,
  type DealBrief,
  type DealCancellation,
  type DealContract,
  type DealContractDocument,
  type DealActionResult,
  type DealCreatorParty,
  type DealDetail,
  type DealDispute,
  type DealDisputeDetail,
  type DealDisputeEntry,
  type DealDisputeRef,
  type DealDraft,
  type DealExtension,
  type DealFile,
  type DealFunding,
  type DealItem,
  type DealPublication,
  type DealRating,
  type DealRatingCriterion,
  type DealRatingEntry,
  type DealRatingSide,
  type DealRetentionCase,
  type DealRole,
  type DealShipment,
  type DealShipping,
  type DealsPage,
  type DealSignature,
  type DealStrike,
  type DealStrikes,
  type DealTimelineRow,
  type DealUpsell,
  type Labeled,
  type Timestamp,
} from '../types/deal';
import type {
  BrandActiveDealDto,
  DealActionMetaDto,
  DealAddonDto,
  DealBriefDto,
  DealCancellationDto,
  DealContractDocumentDto,
  DealContractDto,
  DealCreatorPartyDto,
  DealDisputeDto,
  DealDisputeEntryDto,
  DealDisputeRefDto,
  DealDraftDto,
  DealDto,
  DealExtensionDto,
  DealFileDto,
  DealFundingDto,
  DealItemDto,
  DealLabeledDto,
  DealPublicationDto,
  DealRatingDto,
  DealRatingEntryDto,
  DealRatingSideDto,
  DealRetentionCaseDto,
  DealShipmentDto,
  DealShippingDto,
  DealsPageDto,
  DealSignatureDto,
  DealStrikeDto,
  DealStrikesMetaDto,
  DealTimelineRowDto,
  DealUpsellDto,
} from '../types/dealDto';

// DTO → domain for every Direct Deals resource (rule 04). Unknown enum values become `null`
// (labels still render); malformed money or required timestamps throw instead of showing wrong data.

const oneOf = <T extends string>(values: readonly T[], value: unknown): T | null =>
  typeof value === 'string' && (values as readonly string[]).includes(value) ? (value as T) : null;

const toLabeled = <K extends string>(values: readonly K[], dto: DealLabeledDto): Labeled<K> => ({
  key: oneOf(values, dto.key),
  label: dto.label,
});

const toLabeledOrNull = <K extends string>(
  values: readonly K[],
  dto: DealLabeledDto | null,
): Labeled<K> | null => (dto === null ? null : toLabeled(values, dto));

const toTimestamp = (iso: string): Timestamp => {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new TypeError('Malformed deal timestamp from the server');
  }
  return ms;
};

const toTimestampOrNull = (iso: string | null | undefined): Timestamp | null =>
  iso == null ? null : toTimestamp(iso);

/** The server calls the creator side `influencer`. */
const toRole = (party: string): DealRole | null => {
  if (party === 'brand') return 'brand';
  if (party === 'influencer') return 'creator';
  return null;
};

const ALL_RATING_CRITERIA: readonly DealRatingCriterion[] = [
  ...DEAL_RATING_CRITERIA.brand,
  ...DEAL_RATING_CRITERIA.creator,
];

const toRatingScores = (
  scores: Record<string, number> | null | undefined,
): Partial<Record<DealRatingCriterion, number>> =>
  Object.entries(scores ?? {}).reduce<Partial<Record<DealRatingCriterion, number>>>(
    (acc, [criterion, score]) => {
      const key = oneOf(ALL_RATING_CRITERIA, criterion);
      if (key !== null) acc[key] = score;
      return acc;
    },
    {},
  );

export const mapDealFile = (dto: DealFileDto): DealFile => ({
  id: dto.id,
  kind: oneOf(DEAL_FILE_KIND, dto.kind),
  name: dto.name,
  mime: dto.mime,
  size: dto.size,
  status: oneOf(DEAL_FILE_STATUS, dto.status),
  url: dto.url,
});

const mapCreatorParty = (dto: DealCreatorPartyDto): DealCreatorParty => ({
  slug: dto.slug,
  name: dto.name,
  avatarUrl: dto.avatar_url,
});

const mapAddon = (dto: DealAddonDto): Omit<DealAddon, 'upsellId'> => ({
  type: dto.type,
  label: dto.label,
  price: parseUsd(dto.price_usd),
  options: dto.options,
});

const mapItem = (dto: DealItemDto): DealItem => ({
  id: dto.id,
  rateCardId: dto.rate_card_id,
  upsellId: dto.deal_upsell_id,
  title: dto.title,
  platform: dto.platform,
  service: dto.service,
  packageValue: dto.package_value,
  unitPrice: parseUsd(dto.unit_price_usd),
  addons: dto.addons.map(addon => ({ ...mapAddon(addon), upsellId: addon.upsell_id })),
  total: parseUsd(dto.total_usd),
  deliveryDays: dto.delivery_days,
  deliveryHours: dto.delivery_hours,
  retention: oneOf(DEAL_RETENTION_TERM, dto.retention),
  revisionsAllowed: dto.revisions_allowed,
  revisionsUsed: dto.revisions_used,
  revisionsLeft: dto.revisions_left,
  approveAsIsAvailable: dto.approve_as_is_available,
  status: toLabeled(DEAL_ITEM_STATUS, dto.status),
  dueAt: toTimestampOrNull(dto.due_at),
  timerPaused: dto.timer_paused,
  liveUrl: dto.live_url,
  fixRequestsLeft: dto.fix_requests_left,
  verifiedAt: toTimestampOrNull(dto.verified_at),
});

const mapShipment = (dto: DealShipmentDto): DealShipment => ({
  id: dto.id,
  sequence: dto.sequence,
  courier: dto.courier,
  trackingNo: dto.tracking_no,
  trackingUrl: dto.tracking_url,
  shippedAt: toTimestamp(dto.shipped_at),
  receivedAt: toTimestampOrNull(dto.received_at),
  delayedReportFrom: toTimestamp(dto.delayed_report_from),
  issue: dto.issue && {
    reason: toLabeled(DEAL_SHIPPING_ISSUE_REASON, dto.issue.reason),
    note: dto.issue.note,
    photos: dto.issue.photos.map(({ url, mime, size }) => ({ url, mime, size })),
    reportedAt: toTimestampOrNull(dto.issue.reported_at),
    answerBy: toTimestampOrNull(dto.issue.answer_by),
  },
});

const mapShipping = (dto: DealShippingDto): DealShipping => ({
  shipBy: toTimestampOrNull(dto.ship_by),
  reshipsLeft: dto.reships_left,
  freeCancelFrom: toTimestampOrNull(dto.free_cancel_from),
  shipments: dto.shipments.map(mapShipment),
});

const mapCancellation = ({ brand, influencer }: DealCancellationDto): DealCancellation => ({
  brand: brand && {
    outcome: toLabeled(DEAL_CANCEL_OUTCOME, brand.outcome),
    freeUntil: toTimestampOrNull(brand.free_until),
    refund: parseUsdOrNull(brand.refund_usd),
    killFee: parseUsdOrNull(brand.kill_fee_usd),
    platformFee: parseUsdOrNull(brand.platform_fee_usd),
    creatorNet: parseUsdOrNull(brand.creator_net_usd),
  },
  creator: {
    withdrawAvailable: influencer.withdraw_available,
    strike: influencer.strike,
    refund: parseUsdOrNull(influencer.refund_usd),
  },
});

const mapExtension = (dto: DealExtensionDto): DealExtension => ({
  addendumId: dto.addendum_id,
  status: oneOf(['pending', 'approved', 'lapsed'] as const, dto.status),
  fromHours: dto.from_hours,
  toHours: dto.to_hours,
  reason: dto.reason,
});

const mapDealUpsell = (dto: DealUpsellDto): DealUpsell => ({
  id: dto.id,
  kind: toLabeled(DEAL_UPSELL_KIND, dto.kind),
  status: toLabeled(DEAL_UPSELL_STATUS, dto.status),
  itemId: dto.item_id,
  title: dto.title,
  quantity: dto.quantity,
  addon: dto.addon && mapAddon(dto.addon),
  deliveryHours: dto.delivery_hours,
  amount: parseUsd(dto.amount_usd),
  addendumId: dto.addendum_id,
  addedItemIds: dto.added_item_ids,
  reviewPaused: dto.review_paused,
  dueAt: toTimestampOrNull(dto.due_at),
  declineReason: toLabeledOrNull(DEAL_UPSELL_DECLINE_REASON, dto.decline_reason),
  note: dto.note,
  voidReason: dto.void_reason,
  proposedAt: toTimestampOrNull(dto.proposed_at),
  closedAt: toTimestampOrNull(dto.closed_at),
});

const mapDispute = (dto: DealDisputeDto): DealDispute => ({
  id: dto.id,
  status: toLabeled(DEAL_DISPUTE_STATUS, dto.status),
  openedBy: oneOf(DEAL_ACTOR, dto.opened_by),
  reason: toLabeled(DEAL_DISPUTE_REASON, dto.reason),
  statement: dto.statement,
  priorStatus: oneOf(DEAL_STATUS, dto.prior_status),
  evidenceOpen: dto.evidence_open,
  evidenceDueAt: toTimestampOrNull(dto.evidence_due_at),
  evidenceClosedAt: toTimestampOrNull(dto.evidence_closed_at),
  adminTargetAt: toTimestampOrNull(dto.admin_target_at),
  withdrawnAt: toTimestampOrNull(dto.withdrawn_at),
  ruling: dto.ruling && {
    outcome: toLabeled(DEAL_DISPUTE_OUTCOME, dto.ruling.outcome),
    reason: dto.ruling.reason,
    brandAmount: parseUsd(dto.ruling.brand_usd),
    creatorAmount: parseUsd(dto.ruling.creator_usd),
    commission: parseUsd(dto.ruling.commission_usd),
    creatorNet: parseUsd(dto.ruling.creator_net_usd),
    resolvedAt: toTimestampOrNull(dto.ruling.resolved_at),
  },
  openedAt: toTimestampOrNull(dto.opened_at),
  closedAt: toTimestampOrNull(dto.closed_at),
});

const mapDisputeRef = (dto: DealDisputeRefDto): DealDisputeRef =>
  dto.type === 'file'
    ? {
        type: 'file',
        id: dto.id,
        purpose: oneOf(DEAL_FILE_PURPOSE, dto.purpose),
        file: dto.file && mapDealFile(dto.file),
      }
    : { type: 'shipment_photo', shipmentId: dto.shipment_id, index: dto.index, url: dto.url };

const mapDisputeEntry = (dto: DealDisputeEntryDto): DealDisputeEntry => ({
  id: dto.id,
  party: oneOf(DEAL_ACTOR, dto.party),
  note: dto.note,
  links: dto.links,
  files: dto.files.map(mapDealFile),
  refs: dto.refs.map(mapDisputeRef),
  createdAt: toTimestampOrNull(dto.created_at),
});

/** `GET …/disputes` items and the dispute POST responses. */
export const mapDealDisputeDetail = (dto: DealDisputeDto): DealDisputeDetail => ({
  ...mapDispute(dto),
  entries: (dto.entries ?? []).map(mapDisputeEntry),
});

export const mapDealRetentionCase = (dto: DealRetentionCaseDto): DealRetentionCase => ({
  id: dto.id,
  itemId: dto.item_id,
  reason: toLabeled(DEAL_RETENTION_REASON, dto.reason),
  note: dto.note,
  status: toLabeled(DEAL_RETENTION_STATUS, dto.status),
  reportFiles: dto.report_files.map(mapDealFile),
  response: oneOf(['restored', 'contested'] as const, dto.response),
  responseNote: dto.response_note,
  restoredUrl: dto.restored_url,
  handleChecked: dto.handle_checked,
  restoreFiles: dto.restore_files.map(mapDealFile),
  respondedAt: toTimestampOrNull(dto.responded_at),
  brandDecision: oneOf(['confirmed', 'rejected'] as const, dto.brand_decision),
  brandNote: dto.brand_note,
  decidedAt: toTimestampOrNull(dto.decided_at),
  escalationReason: toLabeledOrNull(DEAL_RETENTION_ESCALATION, dto.escalation_reason),
  escalatedAt: toTimestampOrNull(dto.escalated_at),
  closedReason: dto.closed_reason,
  adminNote: dto.admin_note,
  clawback: parseUsdOrNull(dto.clawback_usd),
  dueAt: toTimestampOrNull(dto.due_at),
  reportedAt: toTimestampOrNull(dto.reported_at),
  closedAt: toTimestampOrNull(dto.closed_at),
});

const mapRatingSide = (dto: DealRatingSideDto): DealRatingSide => ({
  answered: dto.answered,
  // Before the reveal the server sends `answered` alone.
  revealed:
    dto.submitted_at === undefined
      ? null
      : {
          skipped: dto.skipped ?? false,
          scores: toRatingScores(dto.scores),
          overall: dto.overall ?? null,
          comment: dto.comment ?? null,
          submittedAt: toTimestampOrNull(dto.submitted_at),
        },
});

const mapRating = (dto: DealRatingDto): DealRating => ({
  open: dto.open,
  dueAt: toTimestampOrNull(dto.due_at),
  revealedAt: toTimestampOrNull(dto.revealed_at),
  brand: mapRatingSide(dto.brand),
  creator: mapRatingSide(dto.influencer),
});

export const mapBrief = (dto: DealBriefDto): DealBrief => ({
  hashtags: dto.hashtags,
  mentions: dto.mentions,
  talkingPoints: dto.talking_points,
  donts: dto.donts,
  promoCode: dto.promo_code,
  trackingLink: dto.tracking_link,
});

const mapSignature = (dto: DealSignatureDto): DealSignature => ({
  party: toRole(dto.party),
  signedAt: toTimestamp(dto.signed_at),
});

export const mapDeal = (dto: DealDto): Deal => ({
  id: dto.id,
  origin: oneOf(['direct', 'public'] as const, dto.origin),
  status: toLabeled(DEAL_STATUS, dto.status),
  stage: toLabeledOrNull(DEAL_ITEM_STATUS, dto.stage),
  brand: { name: dto.brand.name, avatarUrl: dto.brand.avatar_url },
  creator: mapCreatorParty(dto.creator),
  items: dto.items.map(mapItem),
  itemsCount: dto.items_count,
  total: parseUsd(dto.total_usd),
  shippingMode: toLabeled(DEAL_SHIPPING_MODE, dto.shipping_mode),
  shipping: dto.shipping && mapShipping(dto.shipping),
  cancellation: dto.cancellation && mapCancellation(dto.cancellation),
  deliveryHours: dto.delivery_hours,
  requestedDeliveryDays: dto.requested_delivery_days,
  extendedDeliveryHours: dto.extended_delivery_hours,
  extension: dto.extension && mapExtension(dto.extension),
  declineReason: toLabeledOrNull(DEAL_DECLINE_REASON, dto.decline_reason),
  deadlineAt: toTimestampOrNull(dto.deadline_at),
  upsells: dto.upsells.map(mapDealUpsell),
  upsellWindow: {
    open: dto.upsell_window.open,
    closedReason: dto.upsell_window.closed_reason,
    pendingUpsellId: dto.upsell_window.pending_upsell_id,
  },
  dispute: dto.dispute && mapDispute(dto.dispute),
  disputeWindow: {
    open: dto.dispute_window.open,
    closedReason: dto.dispute_window.closed_reason,
    disputesLeft: dto.dispute_window.disputes_left,
  },
  retention: dto.retention.map(window => ({
    itemId: window.item_id,
    endsAt: toTimestampOrNull(window.ends_at),
    reportAvailable: window.report_available,
    openCaseId: window.open_case_id,
  })),
  retentionCases: dto.retention_cases.map(mapDealRetentionCase),
  rating: dto.rating && mapRating(dto.rating),
  brief: dto.brief && mapBrief(dto.brief),
  briefAttachments: dto.brief_attachments.map(mapDealFile),
  dueAt: toTimestampOrNull(dto.due_at),
  sentAt: toTimestampOrNull(dto.sent_at),
  fundedAt: toTimestampOrNull(dto.funded_at),
  contract: dto.contract && {
    id: dto.contract.id,
    hash: dto.contract.hash,
    signatures: dto.contract.signatures.map(mapSignature),
  },
  createdAt: toTimestampOrNull(dto.created_at),
  updatedAt: toTimestampOrNull(dto.updated_at),
});

export const mapDealTimelineRow = (dto: DealTimelineRowDto): DealTimelineRow => ({
  id: dto.id,
  // The handoff says `deal_item`, the resource sends `item`.
  subject: { type: dto.subject.type === 'deal' ? 'deal' : 'item', id: dto.subject.id },
  from: dto.from && { key: dto.from.key, label: dto.from.label },
  to: { key: dto.to.key, label: dto.to.label },
  actor: toLabeled(DEAL_ACTOR, dto.actor),
  reason: dto.reason,
  metadata: dto.metadata,
  dueAt: toTimestampOrNull(dto.due_at),
  occurredAt: toTimestamp(dto.occurred_at),
  isNote: dto.from !== null && dto.from.key === dto.to.key,
});

export const mapDealDraft = (dto: DealDraftDto): DealDraft => ({
  id: dto.id,
  itemId: dto.item_id,
  round: dto.round,
  caption: dto.caption,
  submittedAt: toTimestamp(dto.submitted_at),
  files: dto.files.map(mapDealFile),
  review: dto.review && {
    decision: toLabeled(DEAL_DRAFT_DECISION, dto.review.decision),
    by: oneOf(DEAL_ACTOR, dto.review.by),
    note: dto.review.note,
    pins: dto.review.pins.map(pin => ({
      fileId: pin.file_id,
      atSecond: pin.at_second ?? null,
      note: pin.note,
    })),
    reviewedAt: toTimestampOrNull(dto.review.reviewed_at),
  },
});

export const mapDealPublication = (dto: DealPublicationDto): DealPublication => ({
  id: dto.id,
  itemId: dto.item_id,
  sequence: dto.sequence,
  url: dto.url,
  platform: dto.platform,
  handle: dto.handle,
  handleChecked: dto.handle_checked,
  submittedAt: toTimestamp(dto.submitted_at),
  proofs: dto.proofs.map(mapDealFile),
  review: dto.review && {
    decision: toLabeled(DEAL_PUBLICATION_DECISION, dto.review.decision),
    by: oneOf(DEAL_ACTOR, dto.review.by),
    note: dto.review.note,
    reviewedAt: toTimestampOrNull(dto.review.reviewed_at),
  },
});

export const mapDealRatingEntry = (dto: DealRatingEntryDto): DealRatingEntry => ({
  id: dto.id,
  ratedBy: toRole(dto.rated_by),
  skipped: dto.skipped,
  scores: toRatingScores(dto.scores),
  overall: dto.overall,
  comment: dto.comment,
  submittedAt: toTimestamp(dto.submitted_at),
});

const mapContractDocument = (dto: DealContractDocumentDto): DealContractDocument => ({
  id: dto.id,
  hash: dto.hash,
  issuedAt: toTimestamp(dto.issued_at),
  document: dto.document,
  signatures: dto.signatures.map(mapSignature),
});

export const mapDealContract = (dto: DealContractDto): DealContract => ({
  ...mapContractDocument(dto),
  termsVersion: dto.terms_version,
  addenda: dto.addenda.map(
    (addendum): DealAddendum => ({
      ...mapContractDocument(addendum),
      sequence: addendum.sequence,
      type: addendum.type,
    }),
  ),
});

export const mapBrandActiveDeal = (dto: BrandActiveDealDto): BrandActiveDeal => ({
  id: dto.id,
  status: toLabeled(DEAL_STATUS, dto.status),
  stage: toLabeledOrNull(DEAL_ITEM_STATUS, dto.stage),
  creator: mapCreatorParty(dto.creator),
  title: dto.title,
  total: parseUsd(dto.total_usd),
  dueAt: toTimestampOrNull(dto.due_at),
  needsAction: dto.needs_action,
  action: toLabeledOrNull(BRAND_DEAL_ACTION, dto.action),
});

const mapStrike = (dto: DealStrikeDto): DealStrike => ({
  id: dto.id,
  dealId: dto.deal_id,
  reason: toLabeled(DEAL_STRIKE_REASON, dto.reason),
  occurredAt: toTimestamp(dto.occurred_at),
  expiresAt: toTimestamp(dto.expires_at),
});

export const mapDealStrikes = (dtos: DealStrikeDto[], meta: DealStrikesMetaDto): DealStrikes => ({
  items: dtos.map(mapStrike),
  activeCount: meta.active_count,
  windowDays: meta.window_days,
});

export const mapDealsPage = ({ items, meta }: DealsPageDto): DealsPage => ({
  items: items.map(mapDeal),
  meta: { currentPage: meta.current_page, lastPage: meta.last_page, total: meta.total },
});

export const mapDealFunding = (dto: DealFundingDto): DealFunding => ({
  funded: dto.funded,
  reason: dto.reason,
  missing: parseUsd(dto.missing_usd),
});

/** Detail (`withMeta`): only the brand side sends `meta.funding`, and only while `awaiting_payment`. */
export const mapDealDetail = (dto: DealDto, meta: DealActionMetaDto): DealDetail => ({
  deal: mapDeal(dto),
  funding: meta.funding ? mapDealFunding(meta.funding) : null,
});

export const mapDealActionResult = (dto: DealDto, meta: DealActionMetaDto): DealActionResult => ({
  ...mapDealDetail(dto, meta),
  draft: meta.draft ? mapDealDraft(meta.draft) : null,
  publication: meta.publication ? mapDealPublication(meta.publication) : null,
  upsellId: meta.upsell_id ?? null,
});
