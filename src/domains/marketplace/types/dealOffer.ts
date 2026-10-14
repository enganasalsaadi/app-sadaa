import type { AddonType, ContractTerms } from '@/core/api';
import type { Money } from '@/core/money';
import type { DealBrief, DealRetentionTerm, DealShippingMode } from './deal';

/** Why a brand can't send an offer, in the server's order (preflight, quote, send errors). */
export const DEAL_BLOCKER_CODE = [
  'kyc_required',
  'deal_creator_unavailable',
  'deal_offer_exists',
  'deal_offer_limit',
  'deal_draft_limit',
] as const;
export type DealBlockerCode = (typeof DEAL_BLOCKER_CODE)[number];

export interface DealBlocker {
  /** `null` = a code this build doesn't know: show `label` on the generic blocker. */
  code: DealBlockerCode | null;
  /** Server text, already localized. */
  label: string;
  /** `deal_offer_exists` only: the open offer to open instead. */
  dealId: string | null;
}

export interface DealUsage {
  used: number;
  limit: number;
}

export interface DealOfferPreflight {
  canOffer: boolean;
  blockers: DealBlocker[];
  /** The brand's newest unsent draft with this creator: offer «continue» instead of a new one. */
  resumeDraftId: string | null;
  openOffers: DealUsage;
  drafts: DealUsage;
}

/** SLA hours from `config('deals.sla_hours')`; the journey never hard-codes them. */
export interface DealWindows {
  influencerResponseHours: number;
  paymentTopUpHours: number;
  brandShipHours: number;
  brandReviewHours: number;
  publishWindowHours: number;
}

export interface DealQuoteAddon {
  type: string;
  label: string;
  price: Money;
}

/** One deliverable as priced by the server. */
export interface DealQuoteItem {
  rateCardId: string;
  title: string;
  platform: string | null;
  unitPrice: Money;
  addons: DealQuoteAddon[];
  total: Money;
  deliveryDays: number;
  /** Rush add-on window; wins over `deliveryDays`. */
  deliveryHours: number | null;
  revisions: number;
  retention: DealRetentionTerm | null;
}

/** Items of one rate card grouped back into the line the brand built (quantity × deliverable). */
export interface DealQuoteLine {
  rateCardId: string;
  title: string;
  platform: string | null;
  quantity: number;
  unitPrice: Money;
  addons: DealQuoteAddon[];
  total: Money;
  revisions: number;
  retention: DealRetentionTerm | null;
}

export interface DealQuote {
  items: DealQuoteItem[];
  lines: DealQuoteLine[];
  total: Money;
  minDeliveryHours: number;
  minDeliveryDays: number;
  requestedDeliveryDays: number | null;
  wallet: { balance: Money; shortfall: Money; isSufficient: boolean };
  contractTerms: ContractTerms | null;
  /** Re-checked on every quote; never `kyc_required` (the quote answers 403 instead). */
  blockers: DealBlocker[];
  windows: DealWindows;
}

export interface DealOfferLine {
  rateCardId: string;
  quantity: number;
  addons: AddonType[];
}

/** What the brand builds; quote, draft save and draft replace all take it. */
export interface DealOfferInput {
  lines: DealOfferLine[];
  shippingMode: DealShippingMode;
  requestedDeliveryDays: number | null;
  brief: DealBrief;
}

export interface DealQuoteArgs {
  creatorSlug: string;
  offer: DealOfferInput;
}

/** Preflight takes the media-kit slug or the profile id (server: one of them, 422 without). */
export type DealPreflightArgs = { creatorSlug: string } | { influencerProfileId: string };
