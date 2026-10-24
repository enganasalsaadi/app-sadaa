import type { Money } from '@/core/money';
import type { CreatorCampaignsGlance } from './campaignHome';

// Mirrors the backend Direct Deals enums exactly (rule 06). Adding a value breaks every
// `Record<DealStatus, …>` map until it is handled. Unknown values from a newer server map to `null`.

export const DEAL_STATUS = [
  'draft',
  'pending_influencer',
  'negotiating_deadline',
  'awaiting_payment',
  'escrow_locked',
  'product_shipping',
  'shipping_issue',
  'in_progress',
  'disputed',
  'completed',
  'declined',
  'expired',
  'cancelled_pre_escrow',
  'cancelled_payment_timeout',
  'cancelled_by_brand',
  'cancelled_with_kill_fee',
  'cancelled_by_influencer',
  'cancelled_shipping_timeout',
  'creator_defaulted',
  'resolved_refund',
  'resolved_payout',
  'resolved_split',
] as const;
export type DealStatus = (typeof DEAL_STATUS)[number];

/** Per-deliverable progress while the deal is `in_progress`; the deal `stage` is the slowest item. */
export const DEAL_ITEM_STATUS = [
  'pending',
  'draft_submitted',
  'revision_requested',
  'approved_to_publish',
  'verifying_live',
  'verified',
] as const;
export type DealItemStatus = (typeof DEAL_ITEM_STATUS)[number];

export const DEAL_SHIPPING_MODE = ['none', 'gift', 'returnable'] as const;
export type DealShippingMode = (typeof DEAL_SHIPPING_MODE)[number];

export const DEAL_DECLINE_REASON = ['schedule_full', 'not_a_fit', 'vacation', 'other'] as const;
export type DealDeclineReason = (typeof DEAL_DECLINE_REASON)[number];

export const DEAL_BRAND_CANCEL_REASON = ['no_longer_needed', 'budget_changed', 'timing_changed', 'other'] as const;
export type DealBrandCancelReason = (typeof DEAL_BRAND_CANCEL_REASON)[number];

export const DEAL_WITHDRAW_REASON = ['schedule_conflict', 'personal', 'brief_concern', 'other'] as const;
export type DealWithdrawReason = (typeof DEAL_WITHDRAW_REASON)[number];

export const DEAL_CANCEL_OUTCOME = ['free', 'kill_fee', 'dispute_only'] as const;
export type DealCancelOutcome = (typeof DEAL_CANCEL_OUTCOME)[number];

/** A returnable sample's way back (contract §5.5); `waived` = the brand let the creator keep it. */
export const DEAL_RETURN_STATUS = ['awaiting_waybill', 'shipped', 'received', 'issue_reported', 'waived'] as const;
export type DealReturnStatus = (typeof DEAL_RETURN_STATUS)[number];

export const DEAL_SHIPPING_ISSUE_REASON = ['delayed', 'damaged', 'incomplete', 'wrong_item', 'other'] as const;
export type DealShippingIssueReason = (typeof DEAL_SHIPPING_ISSUE_REASON)[number];

export const DEAL_DRAFT_DECISION = ['approved', 'auto_approved', 'revision_requested'] as const;
export type DealDraftDecision = (typeof DEAL_DRAFT_DECISION)[number];

export const DEAL_PUBLICATION_DECISION = ['confirmed', 'auto_verified', 'fix_requested'] as const;
export type DealPublicationDecision = (typeof DEAL_PUBLICATION_DECISION)[number];

export const DEAL_UPSELL_KIND = ['deliverable', 'addon', 'extra_revision'] as const;
export type DealUpsellKind = (typeof DEAL_UPSELL_KIND)[number];

export const DEAL_UPSELL_STATUS = ['pending', 'accepted', 'declined', 'withdrawn', 'lapsed', 'voided'] as const;
export type DealUpsellStatus = (typeof DEAL_UPSELL_STATUS)[number];

export const DEAL_UPSELL_DECLINE_REASON = ['schedule_full', 'not_a_fit', 'other'] as const;
export type DealUpsellDeclineReason = (typeof DEAL_UPSELL_DECLINE_REASON)[number];

export const DEAL_DISPUTE_REASON = [
  'brief_not_followed',
  'poor_quality',
  'missed_deadlines',
  'unresponsive',
  'live_post_issue',
  'excessive_revisions',
  'scope_change',
  'brand_unresponsive',
  'product_issue',
  'unfair_rejection',
  'other',
] as const;
export type DealDisputeReason = (typeof DEAL_DISPUTE_REASON)[number];

export const DEAL_DISPUTE_STATUS = ['open', 'withdrawn', 'resolved'] as const;
export type DealDisputeStatus = (typeof DEAL_DISPUTE_STATUS)[number];

export const DEAL_DISPUTE_OUTCOME = ['refund', 'payout', 'split'] as const;
export type DealDisputeOutcome = (typeof DEAL_DISPUTE_OUTCOME)[number];

export const DEAL_RETENTION_REASON = ['deleted', 'made_private', 'edited', 'other'] as const;
export type DealRetentionReason = (typeof DEAL_RETENTION_REASON)[number];

export const DEAL_RETENTION_STATUS = ['awaiting_influencer', 'awaiting_brand', 'escalated', 'closed'] as const;
export type DealRetentionStatus = (typeof DEAL_RETENTION_STATUS)[number];

export const DEAL_RETENTION_ESCALATION = ['contested', 'influencer_silent', 'brand_rejected'] as const;
export type DealRetentionEscalation = (typeof DEAL_RETENTION_ESCALATION)[number];

/** How long a live post must stay up, from the rate card snapshot. */
export const DEAL_RETENTION_TERM = ['24h', '30d', '90d', '180d', 'permanent'] as const;
export type DealRetentionTerm = (typeof DEAL_RETENTION_TERM)[number];

export const DEAL_FILE_KIND = ['video', 'image', 'document'] as const;
export type DealFileKind = (typeof DEAL_FILE_KIND)[number];

export const DEAL_FILE_STATUS = ['pending', 'ready', 'purged'] as const;
export type DealFileStatus = (typeof DEAL_FILE_STATUS)[number];

export const DEAL_FILE_PURPOSE = [
  'draft',
  'brief',
  'proof',
  'evidence',
  'retention_report',
  'retention_restore',
] as const;
export type DealFilePurpose = (typeof DEAL_FILE_PURPOSE)[number];

/** Brand Home "needs your action" keys. */
export const BRAND_DEAL_ACTION = [
  'fund',
  'answer_extension',
  'answer_issue',
  'ship',
  'review_draft',
  'verify_post',
  'add_evidence',
] as const;
export type BrandDealAction = (typeof BRAND_DEAL_ACTION)[number];

/** Creator Home «your turn» keys (`GET /influencer/deals/summary`). */
export const CREATOR_DEAL_ACTION = [
  'reply_offer',
  'confirm_receipt',
  'submit_draft',
  'revise_draft',
  'publish',
  'fix_live_url',
  'answer_upsell',
  'add_evidence',
  'restore_post',
  'rate',
] as const;
export type CreatorDealAction = (typeof CREATOR_DEAL_ACTION)[number];

export const DEAL_STRIKE_REASON = [
  'withdrew',
  'defaulted',
  'dispute_lost',
  'retention_violation',
  'return_overdue',
] as const;
export type DealStrikeReason = (typeof DEAL_STRIKE_REASON)[number];

/** A normal strike clears on its own; a severe one (a withdrawal or default after a gift) also bans public applying. */
export const DEAL_STRIKE_SEVERITY = ['normal', 'severe'] as const;
export type DealStrikeSeverity = (typeof DEAL_STRIKE_SEVERITY)[number];

/** Who moved a deal: the server's actor types (the influencer is our creator). */
export const DEAL_ACTOR = ['brand', 'influencer', 'system', 'admin'] as const;
export type DealActor = (typeof DEAL_ACTOR)[number];

export const DEAL_RATING_CRITERIA = {
  brand: ['content_quality', 'timeliness', 'communication'],
  creator: ['brief_clarity', 'review_speed', 'request_clarity'],
} as const;
export type DealRatingCriterion =
  (typeof DEAL_RATING_CRITERIA)[keyof typeof DEAL_RATING_CRITERIA][number];

const isOneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): value is T =>
    typeof value === 'string' && (values as readonly string[]).includes(value);

export const isDealStatus = isOneOf(DEAL_STATUS);
export const isDealItemStatus = isOneOf(DEAL_ITEM_STATUS);

/** The side of the deal the viewer is on; comes from the server user object (rule 07). */
export type DealRole = 'creator' | 'brand';

/** A server enum with its localized label. `key` is `null` when this build doesn't know the value. */
export interface Labeled<K extends string> {
  key: K | null;
  label: string;
}

/**
 * UX hint only: which action surfaces a deal detail shows. The server re-validates every call (rule 06).
 * Item-level actions live in `DealItemAction`.
 */
export type DealAction =
  // brand
  | 'sendOffer'
  | 'editDraft'
  | 'deleteDraft'
  | 'withdrawOffer'
  | 'answerExtension'
  | 'fund'
  | 'ship'
  | 'answerIssue'
  | 'proposeUpsell'
  | 'cancel'
  | 'reportRetention'
  // creator
  | 'accept'
  | 'decline'
  | 'requestExtension'
  | 'receiveShipment'
  | 'reportIssue'
  | 'freeCancel'
  | 'answerUpsell'
  | 'withdraw'
  | 'restorePost'
  // both
  | 'openDispute'
  | 'addEvidence'
  | 'rate';

export type DealItemAction = 'submitDraft' | 'reviewDraft' | 'approveAsIs' | 'publish' | 'verifyPost';

/** Epoch ms. All deadlines come from the server; `null` on a running timer means paused. */
export type Timestamp = number;

export interface DealParty {
  name: string | null;
  avatarUrl: string | null;
}

/** M4: average of revealed scores (1 decimal) + how many; `null` below 3. Comments are never public. */
export interface PublicRating {
  average: number;
  count: number;
}

/** `rating`: what creators gave this brand; sent to the creator only (`null` for the brand). */
export interface DealBrandParty extends DealParty {
  rating: PublicRating | null;
}

export interface DealCreatorParty extends DealParty {
  /** Media-kit slug; `null` when the creator has no public kit. */
  slug: string | null;
}

export interface DealAddon {
  /** Raw add-on type; unknown types are kept so the line still totals right. */
  type: string;
  label: string;
  price: Money;
  options: Record<string, unknown>;
  /** Bought mid-deal through this upsell; `null` = part of the original offer. */
  upsellId: string | null;
}

export interface DealItem {
  id: string;
  rateCardId: string | null;
  /** Set when an accepted upsell added this deliverable. */
  upsellId: string | null;
  title: string;
  platform: string | null;
  service: string | null;
  packageValue: string | null;
  unitPrice: Money;
  addons: DealAddon[];
  total: Money;
  deliveryDays: number | null;
  deliveryHours: number | null;
  retention: DealRetentionTerm | null;
  revisionsAllowed: number;
  revisionsUsed: number;
  revisionsLeft: number;
  approveAsIsAvailable: boolean;
  status: Labeled<DealItemStatus>;
  dueAt: Timestamp | null;
  timerPaused: boolean;
  liveUrl: string | null;
  fixRequestsLeft: number;
  verifiedAt: Timestamp | null;
}

export interface DealFile {
  id: string;
  kind: DealFileKind | null;
  name: string;
  mime: string;
  size: number;
  status: DealFileStatus | null;
  /** Short-lived download URL; `null` once purged. */
  url: string | null;
}

/** Where a listed deal file belongs (`GET deals/{id}/files`). */
export const DEAL_VAULT_FILE_SOURCE = ['brief', 'draft_round', 'publication', 'dispute', 'shipment'] as const;
export type DealVaultFileSource = (typeof DEAL_VAULT_FILE_SOURCE)[number];

/** One file of the deal's file list; `round` only on a draft round's files. */
export interface DealVaultFile extends DealFile {
  source: DealVaultFileSource | null;
  itemId: string | null;
  round: number | null;
}

export interface DealShipmentPhoto {
  url: string | null;
  mime: string;
  size: number;
}

export interface DealShipment {
  id: string;
  sequence: number;
  courier: string;
  trackingNo: string;
  trackingUrl: string | null;
  shippedAt: Timestamp;
  receivedAt: Timestamp | null;
  delayedReportFrom: Timestamp;
  issue: {
    reason: Labeled<DealShippingIssueReason>;
    note: string | null;
    photos: DealShipmentPhoto[];
    reportedAt: Timestamp | null;
    answerBy: Timestamp | null;
  } | null;
}

/**
 * Where the product goes (B5.1): given by the creator when signing. The brand reads it only while
 * it has to ship; lists never carry it. PII: never logged or stored on the device (rule 07).
 */
export interface DealShippingAddress {
  recipientName: string;
  /** E.164, a Syrian mobile. */
  phone: string;
  governorate: { id: string; label: string } | null;
  city: string;
  area: string;
  addressLine: string;
  landmark: string | null;
  notes: string | null;
  updatedAt: Timestamp | null;
}

export interface DealShipping {
  /** Linked deal: the creator's brief review runs until then, so the brand can't ship before it. */
  shipFrom: Timestamp | null;
  shipBy: Timestamp | null;
  reshipsLeft: number;
  freeCancelFrom: Timestamp | null;
  shipments: DealShipment[];
  address: DealShippingAddress | null;
  /** Creator only: the address can still change (nothing in transit). */
  addressEditable: boolean;
}

export interface DealCancellation {
  brand: {
    outcome: Labeled<DealCancelOutcome>;
    freeUntil: Timestamp | null;
    refund: Money | null;
    killFee: Money | null;
    platformFee: Money | null;
    creatorNet: Money | null;
  } | null;
  creator: {
    withdrawAvailable: boolean;
    /** Withdrawing now records a strike. */
    strike: boolean;
    refund: Money | null;
    /** Linked deal (contract §5.2): the creator can still leave cleanly, with no strike, until `briefExitUntil`. */
    briefExitAvailable: boolean;
    briefExitUntil: Timestamp | null;
  };
}

export interface DealExtension {
  addendumId: string;
  status: 'pending' | 'approved' | 'lapsed' | null;
  fromHours: number | null;
  toHours: number | null;
  reason: string | null;
}

export interface DealUpsell {
  id: string;
  kind: Labeled<DealUpsellKind>;
  status: Labeled<DealUpsellStatus>;
  itemId: string | null;
  title: string | null;
  quantity: number | null;
  addon: Omit<DealAddon, 'upsellId'> | null;
  deliveryHours: number | null;
  amount: Money;
  addendumId: string | null;
  addedItemIds: string[];
  reviewPaused: boolean;
  dueAt: Timestamp | null;
  declineReason: Labeled<DealUpsellDeclineReason> | null;
  note: string | null;
  voidReason: string | null;
  proposedAt: Timestamp | null;
  closedAt: Timestamp | null;
}

/** Whether a new window-gated request is possible now; `closedReason` is a server code. */
export interface DealWindow {
  open: boolean;
  closedReason: string | null;
}

export interface DealDisputeRuling {
  outcome: Labeled<DealDisputeOutcome>;
  reason: string | null;
  brandAmount: Money;
  creatorAmount: Money;
  commission: Money;
  creatorNet: Money;
  resolvedAt: Timestamp | null;
}

export interface DealDispute {
  id: string;
  status: Labeled<DealDisputeStatus>;
  openedBy: DealActor | null;
  reason: Labeled<DealDisputeReason>;
  statement: string;
  priorStatus: DealStatus | null;
  evidenceOpen: boolean;
  evidenceDueAt: Timestamp | null;
  evidenceClosedAt: Timestamp | null;
  /** Shown only; the server does not enforce it. */
  adminTargetAt: Timestamp | null;
  withdrawnAt: Timestamp | null;
  ruling: DealDisputeRuling | null;
  openedAt: Timestamp | null;
  closedAt: Timestamp | null;
}

/** Evidence pointing at something already on the deal. `null` file / url = gone or purged. */
export type DealDisputeRef =
  | { type: 'file'; id: string; purpose: DealFilePurpose | null; file: DealFile | null }
  | { type: 'shipment_photo'; shipmentId: string; index: number; url: string | null };

export interface DealDisputeEntry {
  id: string;
  party: DealActor | null;
  note: string | null;
  links: string[];
  files: DealFile[];
  refs: DealDisputeRef[];
  createdAt: Timestamp | null;
}

/** `GET …/disputes` and the dispute POSTs return the dispute with its evidence thread. */
export interface DealDisputeDetail extends DealDispute {
  entries: DealDisputeEntry[];
}

/** What the viewer points at as evidence (`refs[]`): a file already on the deal or a courier-issue photo. */
export type DealDisputeRefInput =
  | { type: 'file'; id: string }
  | { type: 'shipment_photo'; shipmentId: string; index: number };

/** One evidence entry as sent: the note (required by the server), own uploads, links, refs. */
export interface DealEvidenceInput {
  note: string;
  links: readonly string[];
  fileIds: readonly string[];
  refs: readonly DealDisputeRefInput[];
}

export interface DealRetentionWindow {
  itemId: string;
  endsAt: Timestamp | null;
  reportAvailable: boolean;
  openCaseId: string | null;
}

export interface DealRetentionCase {
  id: string;
  itemId: string;
  reason: Labeled<DealRetentionReason>;
  note: string | null;
  status: Labeled<DealRetentionStatus>;
  reportFiles: DealFile[];
  response: 'restored' | 'contested' | null;
  responseNote: string | null;
  restoredUrl: string | null;
  /** `null` until the creator restores with a link. */
  handleChecked: boolean | null;
  restoreFiles: DealFile[];
  respondedAt: Timestamp | null;
  brandDecision: 'confirmed' | 'rejected' | null;
  brandNote: string | null;
  decidedAt: Timestamp | null;
  escalationReason: Labeled<DealRetentionEscalation> | null;
  escalatedAt: Timestamp | null;
  /** Server code (`upheld`, `dismissed`, …); shown through the status label. */
  closedReason: string | null;
  /** The team's public note when an admin closed the case. */
  adminNote: string | null;
  /** Moved back from the creator to the brand; `null` when nothing was. */
  clawback: Money | null;
  dueAt: Timestamp | null;
  /** Account hold: the answer clock is paused (no escalation, no auto-close); `dueAt` is stale. */
  onHold: boolean;
  reportedAt: Timestamp | null;
  closedAt: Timestamp | null;
}

export interface DealRatingSide {
  answered: boolean;
  /** Present only once ratings are revealed. */
  revealed: {
    skipped: boolean;
    scores: Partial<Record<DealRatingCriterion, number>>;
    overall: number | null;
    comment: string | null;
    submittedAt: Timestamp | null;
  } | null;
}

export interface DealRating {
  open: boolean;
  dueAt: Timestamp | null;
  /** Account hold: the window is paused (`open` stays true, `dueAt` is stale). */
  onHold: boolean;
  revealedAt: Timestamp | null;
  brand: DealRatingSide;
  creator: DealRatingSide;
}

export interface DealSignature {
  party: DealRole | null;
  signedAt: Timestamp;
}

/** The signed contract or an addendum: `document` is the bilingual snapshot, shown as-is (Arabic governs). */
export interface DealContractDocument {
  id: string;
  hash: string;
  issuedAt: Timestamp;
  document: Record<string, unknown>;
  signatures: DealSignature[];
}

export interface DealAddendum extends DealContractDocument {
  sequence: number;
  /** Server addendum type (`deadline_extension`, upsell, …). */
  type: string | null;
}

export interface DealContract extends DealContractDocument {
  termsVersion: string;
  addenda: DealAddendum[];
}

/** `POST …/rating`: exactly the role's three criteria, 1–5 each; the note is optional. */
export interface DealRatingRequest {
  scores: Partial<Record<DealRatingCriterion, number>>;
  comment?: string;
}

/** The caller's own rating, returned by submit / skip. */
export interface DealRatingEntry {
  id: string;
  ratedBy: DealRole | null;
  skipped: boolean;
  scores: Partial<Record<DealRatingCriterion, number>>;
  overall: number | null;
  comment: string | null;
  submittedAt: Timestamp;
}

/** Brand Home open-deal row: "needs your action" first, then soonest `dueAt`. */
export interface BrandActiveDeal {
  id: string;
  status: Labeled<DealStatus>;
  stage: Labeled<DealItemStatus> | null;
  creator: DealCreatorParty;
  title: string;
  total: Money;
  /** Deadline of `action`, else the deal's next deadline. */
  dueAt: Timestamp | null;
  needsAction: boolean;
  action: Labeled<BrandDealAction> | null;
  /** Set for a campaign seat: the row carries a campaign chip. */
  campaign: DealCampaignRef | null;
}

/** Creator Home open-deal row: «needs you» first, then soonest `dueAt`. */
export interface CreatorActiveDeal {
  id: string;
  status: Labeled<DealStatus>;
  stage: Labeled<DealItemStatus> | null;
  brand: DealParty;
  title: string;
  total: Money;
  /** Deadline of `action`, else the deal's next deadline. */
  dueAt: Timestamp | null;
  needsAction: boolean;
  action: Labeled<CreatorDealAction> | null;
}

/** Creator Home «your turn»: `activeDeals` is `null` only before the first offer ever (welcome). */
export interface CreatorDealSummary {
  activeDeals: {
    needsActionCount: number;
    totalCount: number;
    items: CreatorActiveDeal[];
  } | null;
  counts: { newOffers: number; pendingUpsells: number; liveStrikes: number };
  /** Public Campaigns flag (contract §1.2): `campaigns` is `null` while it is off. */
  campaignsEnabled: boolean;
  /** «Campaigns for you» (contract §6.3); `null` while the flag is off. */
  campaigns: CreatorCampaignsGlance | null;
}

export interface DealStrike {
  id: string;
  dealId: string;
  reason: Labeled<DealStrikeReason>;
  /** `null` from a server that doesn't send it yet. */
  severity: Labeled<DealStrikeSeverity> | null;
  occurredAt: Timestamp;
  expiresAt: Timestamp;
}

export interface DealStrikes {
  items: DealStrike[];
  activeCount: number;
  windowDays: number;
}

/** Brand's creative guidelines; they become contract terms. */
export interface DealBrief {
  hashtags: string[];
  mentions: string[];
  talkingPoints: string[];
  donts: string[];
  promoCode: string | null;
  trackingLink: string | null;
}

/** The public campaign a linked deal came from (contract §5.1). */
export interface DealCampaignRef {
  id: string;
  title: string;
}

/** Synchronized drop (contract §5.4): everyone posts together; the live link opens a little before. */
export interface DealDrop {
  dropAt: Timestamp;
  publishOpensAt: Timestamp;
  publishOpen: boolean;
}

/** The sample's way back when the deal closes (contract §5.5). */
export interface DealReturnShipment {
  id: string;
  status: Labeled<DealReturnStatus>;
  waybillDueAt: Timestamp | null;
  overdue: boolean;
  courier: string | null;
  trackingNo: string | null;
  trackingUrl: string | null;
  handedAt: Timestamp | null;
  shippedAt: Timestamp | null;
  /** The brand's silence ends here: the sample counts as received. */
  confirmBy: Timestamp | null;
  receivedAt: Timestamp | null;
  autoReceived: boolean;
  issue: {
    note: string;
    photos: DealShipmentPhoto[];
    reportedAt: Timestamp | null;
  } | null;
  waivedAt: Timestamp | null;
  waiveNote: string | null;
  /** Account hold: the creator's account is under review; no reminder or strike until it ends. */
  onHold: boolean;
}

/** Account hold: paused while Sada reviews an account (never says whose). */
export interface DealHold {
  since: Timestamp;
}

export interface Deal {
  id: string;
  origin: 'direct' | 'public' | null;
  /** Set on a linked deal, `null` on a direct one: opens the campaign. */
  campaign: DealCampaignRef | null;
  /** The creator can't read the brief before the deal is funded. */
  briefHidden: boolean;
  /** `null` on a direct deal or a campaign without a drop. */
  drop: DealDrop | null;
  /** `null` until a returnable sample's return opens. */
  returnShipment: DealReturnShipment | null;
  status: Labeled<DealStatus>;
  /** Read-only, timers stopped (`dueAt` values are stale); every action answers 409 `deal_party_suspended`. */
  onHold: DealHold | null;
  /** Slowest item's status while `in_progress`; otherwise `null`. */
  stage: Labeled<DealItemStatus> | null;
  brand: DealBrandParty;
  creator: DealCreatorParty;
  items: DealItem[];
  itemsCount: number;
  total: Money;
  shippingMode: Labeled<DealShippingMode>;
  shipping: DealShipping | null;
  cancellation: DealCancellation | null;
  deliveryHours: number | null;
  requestedDeliveryDays: number | null;
  extendedDeliveryHours: number | null;
  extension: DealExtension | null;
  declineReason: Labeled<DealDeclineReason> | null;
  deadlineAt: Timestamp | null;
  upsells: DealUpsell[];
  upsellWindow: DealWindow & { pendingUpsellId: string | null };
  dispute: DealDispute | null;
  disputeWindow: DealWindow & { disputesLeft: number };
  retention: DealRetentionWindow[];
  retentionCases: DealRetentionCase[];
  rating: DealRating | null;
  brief: DealBrief | null;
  briefAttachments: DealFile[];
  /** Current SLA deadline; `null` while timers are frozen (shipping issue, dispute). */
  dueAt: Timestamp | null;
  sentAt: Timestamp | null;
  fundedAt: Timestamp | null;
  contract: { id: string; hash: string; signatures: DealSignature[] } | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface DealTimelineRow {
  id: string;
  subject: { type: 'deal' | 'item'; id: string };
  from: { key: string; label: string } | null;
  to: { key: string; label: string };
  actor: Labeled<DealActor>;
  /** Server reason code; unknown reasons still render from `to.label`. */
  reason: string | null;
  metadata: Record<string, unknown> | null;
  dueAt: Timestamp | null;
  occurredAt: Timestamp;
  /** `from == to`: an event, not a status change. */
  isNote: boolean;
}

/** A brand pin on a draft file: an exact moment (video) or the whole file. */
export interface DealDraftPin {
  fileId: string;
  atSecond: number | null;
  note: string;
}

export interface DealDraft {
  id: string;
  itemId: string;
  round: number;
  caption: string | null;
  submittedAt: Timestamp;
  files: DealFile[];
  /** `null` while the brand is still reviewing. */
  review: {
    decision: Labeled<DealDraftDecision>;
    by: DealActor | null;
    note: string | null;
    pins: DealDraftPin[];
    reviewedAt: Timestamp | null;
  } | null;
}

export interface DealPublication {
  id: string;
  itemId: string;
  sequence: number;
  url: string | null;
  platform: string | null;
  handle: string | null;
  /** `false` = the server couldn't read the link's account; the brand must check the proofs. */
  handleChecked: boolean;
  submittedAt: Timestamp;
  proofs: DealFile[];
  review: {
    decision: Labeled<DealPublicationDecision>;
    by: DealActor | null;
    note: string | null;
    reviewedAt: Timestamp | null;
  } | null;
}

/** Which deal and from which side: brand and creator read the same deal from different routes. */
export interface DealRef {
  role: DealRole;
  id: string;
}

/** One deliverable of a deal, from the viewer's side (drafts, publications). */
export interface DealItemRef extends DealRef {
  itemId: string;
}

/**
 * What an upsell would cost before the brand signs it (`upsells/quote`, M8): the server's price,
 * new deal total and the wallet's shortfall. `revisions` only on an extra revision round.
 */
export interface DealUpsellQuote {
  kind: Labeled<DealUpsellKind>;
  itemId: string | null;
  title: string | null;
  amount: Money;
  revisions: { from: number; to: number } | null;
  total: { from: Money; to: Money };
  wallet: { balance: Money; shortfall: Money; isSufficient: boolean };
}

/**
 * What the brand adds mid-deal (M8): one more deliverable from the creator's rate cards, an add-on
 * on a deliverable already in the deal, or one more revision round on it. Quoted, then signed.
 */
export type DealUpsellRequest =
  | { kind: 'deliverable'; rateCardId: string; quantity: number; addons: readonly string[] }
  | { kind: 'addon'; itemId: string; addonType: string }
  | { kind: 'extra_revision'; itemId: string };

export interface DealListArgs {
  role: DealRole;
  /** Empty or missing = every status the role can see (creators never see drafts). */
  statuses?: readonly DealStatus[];
}

export interface DealsPage {
  items: Deal[];
  meta: { currentPage: number; lastPage: number; total: number };
}

export interface DealFunding {
  funded: boolean;
  reason: string | null;
  /** What the brand's wallet still lacks; zero when funded. */
  missing: Money;
}

/** Deal detail: brand detail carries `funding` while `awaiting_payment`, otherwise `null`. */
export interface DealDetail {
  deal: Deal;
  funding: DealFunding | null;
}

export interface DealActionResult extends DealDetail {
  draft: DealDraft | null;
  publication: DealPublication | null;
  upsellId: string | null;
}

type DealItemPath<A extends string> = `items/${string}/${A}`;

/**
 * Every action route whose success `data` is the full deal (handoff §0), relative to
 * `/{brand|influencer}/deals/{id}/`. Routes answering another resource (rating, retention,
 * opening a dispute or adding evidence) and the multipart `shipment/issue` and `return-shipment/issue` get their own mutations.
 */
export type DealActionPath =
  // brand
  | 'send'
  | 'fund'
  | 'cancel'
  | 'extension/approve'
  | 'extension/decline'
  | 'shipment'
  | 'return-shipment/receive'
  | 'return-shipment/waive'
  | DealItemPath<'approve' | 'revision' | 'verify' | 'fix'>
  | 'upsells'
  | `upsells/${string}/withdraw`
  // creator
  | 'accept'
  | 'decline'
  | 'extension'
  | 'shipment/receive'
  | 'return-shipment'
  | 'brief-exit'
  | DealItemPath<'drafts' | 'publish'>
  | `upsells/${string}/${'accept' | 'decline'}`
  // both (brand pulls back an offer / creator withdraws with a strike; shipping cancel is per role)
  | 'withdraw'
  | 'shipment/cancel'
  | 'shipping-address'
  | 'dispute/withdraw';

export interface DealActionArgs {
  ref: DealRef;
  path: DealActionPath;
  /** `PUT` only for editing a shipment or the delivery address. */
  method?: 'POST' | 'PUT';
  body?: Record<string, unknown>;
  /** Money / binding actions (rule 06): accept, fund, cancel, upsells, extension approve. */
  idempotencyKey?: string;
}

/** What a screen passes per tap; the ref and the idempotency key come from `useDealAction`. */
export type DealActionRequest = Pick<DealActionArgs, 'method' | 'body'>;
