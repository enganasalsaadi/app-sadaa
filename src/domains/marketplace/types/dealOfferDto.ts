// Wire shapes of the brand offer builder (handoff M2 + preflight, B2): snake_case as sent.
// Every field added after B2 (`blockers`, `windows`) is optional: an older server simply omits it.

import type { ContractTerms } from '@/core/api';
import type { DealBriefDto } from './dealDto';

export interface DealBlockerDto {
  code: string;
  /** Localized from `Accept-Language`. */
  label: string;
  /** Only on `deal_offer_exists`: the newest open offer with this creator. */
  deal_id?: string | null;
}

export interface DealUsageDto {
  used: number;
  limit: number;
}

/** `GET /brand/deals/preflight`. */
export interface DealOfferPreflightDto {
  can_offer: boolean;
  blockers: DealBlockerDto[];
  resume_draft_id: string | null;
  open_offers: DealUsageDto;
  drafts: DealUsageDto;
}

export interface DealQuoteAddonDto {
  type: string;
  label: string;
  price_usd: string;
  options: Record<string, unknown>;
}

/** One deliverable: a line with `quantity: 3` comes back as three rows. */
export interface DealQuoteItemDto {
  rate_card_id: string;
  title: string;
  platform: string | null;
  service: string;
  package_value: string | number | null;
  unit_price_usd: string;
  addons: DealQuoteAddonDto[];
  total_usd: string;
  delivery_days: number;
  delivery_hours: number | null;
  revisions: number;
  retention: string | null;
}

export interface DealQuoteWindowsDto {
  influencer_response_hours: number;
  payment_top_up_hours: number;
  brand_ship_hours: number;
  brand_review_hours: number;
  publish_window_hours: number;
}

/** `POST /brand/deals/quote`; also `meta.quote` inside `409 deal_price_changed` (without blockers/windows). */
export interface DealQuoteDto {
  items: DealQuoteItemDto[];
  total_usd: string;
  currency: string;
  min_delivery_hours: number;
  min_delivery_days: number;
  requested_delivery_days: number | null;
  wallet: { balance_usd: string; shortfall_usd: string; is_sufficient: boolean };
  contract_terms: ContractTerms | null;
  blockers?: DealBlockerDto[];
  windows?: DealQuoteWindowsDto;
}

/** Quote, draft create and draft replace share one body (`DealOfferRules`). */
export interface DealOfferBodyDto {
  lines: { rate_card_id: string; quantity: number; addons: string[] }[];
  shipping_mode: string;
  requested_delivery_days: number | null;
  brief: DealBriefDto;
}
