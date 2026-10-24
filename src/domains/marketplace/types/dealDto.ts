// Wire shapes of the backend Direct Deals resources (`Deals/Http/Resources/*`), snake_case as sent.
// Enum keys stay `string`: a newer server may send values this build doesn't know (mappers narrow them).
// Money is a USD string (`"150.00"`); times are ISO 8601 with offset.

import type { CreatorCampaignsDto } from './campaignHome';

export interface DealLabeledDto {
  key: string;
  label: string;
}

export interface DealPartyDto {
  name: string | null;
  avatar_url: string | null;
}

/** M4: average of revealed scores; `null` below 3 ratings. Comments are never public. */
export interface PublicRatingDto {
  average: number;
  count: number;
}

export interface DealCreatorPartyDto extends DealPartyDto {
  slug: string | null;
}

export interface DealFileDto {
  id: string;
  kind: string;
  name: string;
  mime: string;
  size: number;
  sha256: string | null;
  status: string;
  url: string | null;
}

/** One row of `GET deals/{id}/files`: newest first, links freshly signed on every read. */
export interface DealVaultFileDto {
  id: string;
  kind: string | null;
  name: string;
  mime: string;
  size: number;
  status: string;
  url: string | null;
  url_expires_at: string | null;
  source: string;
  item_id: string | null;
  round: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface DealVaultFilesDto {
  items: DealVaultFileDto[];
}

/** Creative guidelines (`DealBrief::toArray`); lists drop blanks server-side. */
export interface DealBriefDto {
  hashtags: string[];
  mentions: string[];
  talking_points: string[];
  donts: string[];
  promo_code: string | null;
  tracking_link: string | null;
}

export interface DealAddonDto {
  type: string;
  label: string;
  price_usd: string;
  options: Record<string, unknown>;
}

export interface DealItemAddonDto extends DealAddonDto {
  upsell_id: string | null;
}

export interface DealItemDto {
  id: string;
  rate_card_id: string | null;
  deal_upsell_id: string | null;
  title: string;
  platform: string | null;
  service: string | null;
  package_value: string | null;
  unit_price_usd: string;
  addons: DealItemAddonDto[];
  total_usd: string;
  delivery_days: number | null;
  delivery_hours: number | null;
  retention: string | null;
  revisions_allowed: number;
  revisions_used: number;
  revisions_left: number;
  approve_as_is_available: boolean;
  status: DealLabeledDto;
  due_at: string | null;
  timer_paused: boolean;
  live_url: string | null;
  fix_requests_left: number;
  verified_at: string | null;
}

export interface DealShipmentDto {
  id: string;
  sequence: number;
  courier: string;
  tracking_no: string;
  tracking_url: string | null;
  shipped_at: string;
  received_at: string | null;
  delayed_report_from: string;
  issue: {
    reason: DealLabeledDto;
    note: string | null;
    photos: { url: string | null; mime: string; size: number }[];
    reported_at: string | null;
    answer_by: string | null;
  } | null;
}

export interface DealShippingAddressDto {
  recipient_name: string;
  phone: string;
  governorate: { id: string; label: string } | null;
  city: string;
  area: string;
  address_line: string;
  landmark: string | null;
  notes: string | null;
  updated_at: string | null;
}

export interface DealShippingDto {
  /** Linked deal; absent on servers that predate Public Campaigns. */
  ship_from?: string | null;
  ship_by: string | null;
  reships_left: number;
  free_cancel_from: string | null;
  shipments: DealShipmentDto[];
  /** B5.1; absent on servers that predate it. */
  address?: DealShippingAddressDto | null;
  address_editable?: boolean;
}

export interface DealCancellationDto {
  brand: {
    outcome: DealLabeledDto;
    free_until: string | null;
    refund_usd: string | null;
    kill_fee_usd: string | null;
    platform_fee_usd: string | null;
    creator_net_usd: string | null;
  } | null;
  influencer: {
    withdraw_available: boolean;
    strike: boolean;
    refund_usd: string | null;
    /** Linked deal; absent on servers that predate Public Campaigns. */
    brief_exit_available?: boolean;
    brief_exit_until?: string | null;
  };
}

export interface DealExtensionDto {
  addendum_id: string;
  status: string;
  from_hours: number | null;
  to_hours: number | null;
  reason: string | null;
}

export interface DealUpsellDto {
  id: string;
  kind: DealLabeledDto;
  status: DealLabeledDto;
  item_id: string | null;
  title: string | null;
  quantity: number | null;
  addon: DealAddonDto | null;
  delivery_hours: number | null;
  amount_usd: string;
  currency: string;
  addendum_id: string | null;
  added_item_ids: string[];
  review_paused: boolean;
  due_at: string | null;
  decline_reason: DealLabeledDto | null;
  note: string | null;
  void_reason: string | null;
  proposed_at: string | null;
  closed_at: string | null;
}

export interface DealDisputeRulingDto {
  outcome: DealLabeledDto;
  reason: string | null;
  brand_usd: string;
  creator_usd: string;
  commission_usd: string;
  creator_net_usd: string;
  resolved_at: string | null;
}

export type DealDisputeRefDto =
  | { type: 'file'; id: string; purpose: string | null; file: DealFileDto | null }
  | { type: 'shipment_photo'; shipment_id: string; index: number; url: string | null };

export interface DealDisputeEntryDto {
  id: string;
  party: string;
  note: string | null;
  links: string[];
  files: DealFileDto[];
  refs: DealDisputeRefDto[];
  created_at: string | null;
}

export interface DealDisputeDto {
  id: string;
  status: DealLabeledDto;
  opened_by: string;
  reason: DealLabeledDto;
  statement: string;
  prior_status: string;
  evidence_open: boolean;
  evidence_due_at: string;
  evidence_closed_at: string | null;
  admin_target_at: string;
  withdrawn_at: string | null;
  resolution: string | null;
  ruling: DealDisputeRulingDto | null;
  opened_at: string | null;
  closed_at: string | null;
  /** Present on `GET …/disputes` and the dispute POSTs; absent inside the deal. */
  entries?: DealDisputeEntryDto[];
}

export interface DealRetentionWindowDto {
  item_id: string;
  ends_at: string | null;
  report_available: boolean;
  open_case_id: string | null;
}

export interface DealRetentionCaseDto {
  id: string;
  item_id: string;
  reason: DealLabeledDto;
  note: string | null;
  status: DealLabeledDto;
  report_files: DealFileDto[];
  response: string | null;
  response_note: string | null;
  restored_url: string | null;
  handle_checked: boolean | null;
  restore_files: DealFileDto[];
  responded_at: string | null;
  brand_decision: string | null;
  brand_note: string | null;
  decided_at: string | null;
  escalation_reason: DealLabeledDto | null;
  escalated_at: string | null;
  closed_reason: string | null;
  admin_note: string | null;
  clawback_usd: string | null;
  due_at: string | null;
  /** Account hold: answer clock paused while a party is suspended. */
  on_hold?: boolean;
  reported_at: string | null;
  closed_at: string | null;
}

/** Before reveal only `answered` is sent. */
export interface DealRatingSideDto {
  answered: boolean;
  skipped?: boolean;
  scores?: Record<string, number> | null;
  overall?: number | null;
  comment?: string | null;
  submitted_at?: string;
}

export interface DealRatingDto {
  open: boolean;
  due_at: string | null;
  /** Account hold: window paused while a party is suspended (don't count down). */
  on_hold?: boolean;
  revealed_at: string | null;
  brand: DealRatingSideDto;
  influencer: DealRatingSideDto;
}

export interface DealSignatureDto {
  party: string;
  signed_at: string;
}

export interface DealReturnShipmentDto {
  id: string;
  status: DealLabeledDto;
  waybill_due_at: string | null;
  overdue: boolean;
  courier: string | null;
  tracking_no: string | null;
  tracking_url: string | null;
  handed_at: string | null;
  shipped_at: string | null;
  confirm_by: string | null;
  received_at: string | null;
  auto_received: boolean;
  issue: {
    note: string;
    photos: { url: string | null; mime: string; size: number }[];
    reported_at: string | null;
  } | null;
  waived_at: string | null;
  waive_note: string | null;
  /** Account hold (API 2026-10-23): the creator's account is under review; no reminder or strike until it ends. */
  on_hold?: boolean;
}

export interface DealDto {
  id: string;
  origin: string;
  /** The Public Campaigns fields are absent on servers that predate them. */
  campaign?: { id: string; title: string } | null;
  brief_hidden?: boolean;
  drop?: { drop_at: string; publish_opens_at: string; publish_open: boolean } | null;
  return_shipment?: DealReturnShipmentDto | null;
  status: DealLabeledDto;
  /**
   * Account hold (API 2026-10-23): paused while Sada reviews an account. Read-only,
   * timers stopped; every action answers 409 `deal_party_suspended`. Absent on older servers.
   */
  on_hold?: { since: string } | null;
  stage: DealLabeledDto | null;
  /** `rating`: what creators gave this brand; sent to the creator only (null for the brand). */
  brand: DealPartyDto & { rating?: PublicRatingDto | null };
  creator: DealCreatorPartyDto;
  items: DealItemDto[];
  items_count: number;
  total_usd: string;
  currency: string;
  shipping_mode: DealLabeledDto;
  shipping: DealShippingDto | null;
  cancellation: DealCancellationDto | null;
  delivery_hours: number | null;
  requested_delivery_days: number | null;
  extended_delivery_hours: number | null;
  extension: DealExtensionDto | null;
  decline_reason: DealLabeledDto | null;
  deadline_at: string | null;
  upsells: DealUpsellDto[];
  upsell_window: { open: boolean; closed_reason: string | null; pending_upsell_id: string | null };
  dispute: DealDisputeDto | null;
  dispute_window: { open: boolean; closed_reason: string | null; disputes_left: number };
  retention: DealRetentionWindowDto[];
  retention_cases: DealRetentionCaseDto[];
  rating: DealRatingDto | null;
  brief: DealBriefDto | null;
  brief_attachments: DealFileDto[];
  due_at: string | null;
  sent_at: string | null;
  funded_at: string | null;
  contract: { id: string; hash: string; signatures: DealSignatureDto[] } | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DealTimelineRowDto {
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

export interface DealDraftDto {
  id: string;
  item_id: string;
  round: number;
  caption: string | null;
  submitted_at: string;
  files: DealFileDto[];
  review: {
    decision: DealLabeledDto;
    by: string | null;
    note: string | null;
    pins: { file_id: string; at_second?: number | null; note: string }[];
    reviewed_at: string | null;
  } | null;
}

export interface DealPublicationDto {
  id: string;
  item_id: string;
  sequence: number;
  url: string | null;
  platform: string | null;
  handle: string | null;
  handle_checked: boolean;
  submitted_at: string;
  proofs: DealFileDto[];
  review: {
    decision: DealLabeledDto;
    by: string | null;
    note: string | null;
    reviewed_at: string | null;
  } | null;
}

export interface DealRatingEntryDto {
  id: string;
  rated_by: string;
  skipped: boolean;
  scores: Record<string, number> | null;
  overall: number | null;
  comment: string | null;
  submitted_at: string;
}

export interface DealContractDocumentDto {
  id: string;
  hash: string;
  issued_at: string;
  document: Record<string, unknown>;
  signatures: DealSignatureDto[];
}

export interface DealContractDto extends DealContractDocumentDto {
  terms_version: string;
  addenda: (DealContractDocumentDto & { sequence: number; type: string | null })[];
}

export interface BrandActiveDealDto {
  id: string;
  status: DealLabeledDto;
  stage: DealLabeledDto | null;
  creator: DealCreatorPartyDto;
  title: string;
  total_usd: string;
  due_at: string | null;
  needs_action: boolean;
  action: DealLabeledDto | null;
  /** Contract §6.2: the campaign a seat deal came from; `null` for a direct deal, absent on older servers. */
  campaign?: { id: string; title: string } | null;
}

/** `GET /influencer/deals/summary`: the creator's open deals. */
export interface CreatorActiveDealDto {
  id: string;
  status: DealLabeledDto;
  stage: DealLabeledDto | null;
  brand: { name: string | null; logo: string | null };
  title: string;
  total_usd: string;
  due_at: string | null;
  needs_action: boolean;
  action: DealLabeledDto | null;
}

export interface CreatorDealSummaryDto {
  /** `null` only when the creator never got an offer (welcome state). */
  active_deals: {
    needs_action_count: number;
    total_count: number;
    items: CreatorActiveDealDto[];
  } | null;
  counts: { new_offers: number; pending_upsells: number; live_strikes: number };
  /** Contract §6.3: `null` = flag off. */
  campaigns?: CreatorCampaignsDto | null;
}

export interface DealStrikeDto {
  id: string;
  deal_id: string;
  reason: DealLabeledDto;
  severity?: DealLabeledDto | null;
  occurred_at: string;
  expires_at: string;
}

/** `GET /influencer/strikes` success `meta`. */
export interface DealStrikesMetaDto {
  active_count: number;
  window_days: number;
}

/** `GET /{brand|influencer}/deals`: the page lives in `data` (`{ items, meta }`), newest activity first. */
export interface DealsPageDto {
  items: DealDto[];
  meta: { current_page: number; last_page: number; total: number };
}

/** `meta.funding` on accept, extension approve and the brand detail while `awaiting_payment`. */
export interface DealFundingDto {
  funded: boolean;
  /** Why escrow wasn't held (`insufficient_funds`, `wallet_frozen`…); `null` when funded. */
  reason: string | null;
  missing_usd: string;
}

export interface DealUpsellQuoteDto {
  kind: DealLabeledDto;
  item_id: string | null;
  title: string | null;
  amount_usd: string;
  revisions: { from: number; to: number } | null;
  total_usd: { from: string; to: string };
  wallet: { balance_usd: string; shortfall_usd: string; is_sufficient: boolean };
}

/** Success `meta` of a deal action; each key only on the actions that send it. */
export interface DealActionMetaDto {
  funding?: DealFundingDto;
  /** Draft submit (201). */
  draft?: DealDraftDto;
  /** Publish (201). */
  publication?: DealPublicationDto;
  /** Upsell propose (201). */
  upsell_id?: string;
}
