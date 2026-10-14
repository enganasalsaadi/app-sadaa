import { parseUsd, type Money } from '@/core/money';
import { DEFAULT_DEAL_WINDOWS } from '../constants/dealOffer';
import { DEAL_RETENTION_TERM } from '../types/deal';
import type { DealBriefDto } from '../types/dealDto';
import {
  DEAL_BLOCKER_CODE,
  type DealBlocker,
  type DealOfferInput,
  type DealOfferPreflight,
  type DealPreflightArgs,
  type DealQuote,
  type DealQuoteItem,
  type DealQuoteLine,
  type DealWindows,
} from '../types/dealOffer';
import type {
  DealBlockerDto,
  DealOfferBodyDto,
  DealOfferPreflightDto,
  DealQuoteDto,
  DealQuoteItemDto,
  DealQuoteWindowsDto,
} from '../types/dealOfferDto';

const oneOf = <T extends string>(values: readonly T[], value: unknown): T | null =>
  typeof value === 'string' && (values as readonly string[]).includes(value) ? (value as T) : null;

export const mapDealBlocker = (dto: DealBlockerDto): DealBlocker => ({
  code: oneOf(DEAL_BLOCKER_CODE, dto.code),
  label: dto.label,
  dealId: dto.deal_id ?? null,
});

export const mapDealOfferPreflight = (dto: DealOfferPreflightDto): DealOfferPreflight => ({
  canOffer: dto.can_offer,
  blockers: dto.blockers.map(mapDealBlocker),
  resumeDraftId: dto.resume_draft_id,
  openOffers: { used: dto.open_offers.used, limit: dto.open_offers.limit },
  drafts: { used: dto.drafts.used, limit: dto.drafts.limit },
});

const positive = (hours: number | undefined, fallback: number): number =>
  typeof hours === 'number' && Number.isFinite(hours) && hours > 0 ? hours : fallback;

/** A missing or broken window falls back to the B2 default, one field at a time. */
const mapWindows = (dto: DealQuoteWindowsDto | undefined): DealWindows => ({
  influencerResponseHours: positive(dto?.influencer_response_hours, DEFAULT_DEAL_WINDOWS.influencerResponseHours),
  paymentTopUpHours: positive(dto?.payment_top_up_hours, DEFAULT_DEAL_WINDOWS.paymentTopUpHours),
  brandShipHours: positive(dto?.brand_ship_hours, DEFAULT_DEAL_WINDOWS.brandShipHours),
  brandReviewHours: positive(dto?.brand_review_hours, DEFAULT_DEAL_WINDOWS.brandReviewHours),
  publishWindowHours: positive(dto?.publish_window_hours, DEFAULT_DEAL_WINDOWS.publishWindowHours),
});

const mapQuoteItem = (dto: DealQuoteItemDto): DealQuoteItem => ({
  rateCardId: dto.rate_card_id,
  title: dto.title,
  platform: dto.platform,
  unitPrice: parseUsd(dto.unit_price_usd),
  addons: dto.addons.map(addon => ({ type: addon.type, label: addon.label, price: parseUsd(addon.price_usd) })),
  total: parseUsd(dto.total_usd),
  deliveryDays: dto.delivery_days,
  deliveryHours: dto.delivery_hours,
  revisions: dto.revisions,
  retention: oneOf(DEAL_RETENTION_TERM, dto.retention),
});

/** Deliverables of one rate card back into the line the brand built, in first-seen order. */
export const groupQuoteLines = (items: readonly DealQuoteItem[]): DealQuoteLine[] => {
  const lines = new Map<string, DealQuoteLine>();
  items.forEach(item => {
    const line = lines.get(item.rateCardId);
    if (line) {
      line.quantity += 1;
      // Exact: integer cents of the server's own item totals (one currency per deal).
      line.total = { ...line.total, amount: line.total.amount + item.total.amount };
      return;
    }
    lines.set(item.rateCardId, {
      rateCardId: item.rateCardId,
      title: item.title,
      platform: item.platform,
      quantity: 1,
      unitPrice: item.unitPrice,
      addons: item.addons,
      total: item.total,
      revisions: item.revisions,
      retention: item.retention,
    });
  });
  return [...lines.values()];
};

export const mapDealQuote = (dto: DealQuoteDto): DealQuote => {
  const items = dto.items.map(mapQuoteItem);
  return {
    items,
    lines: groupQuoteLines(items),
    total: parseUsd(dto.total_usd),
    minDeliveryHours: dto.min_delivery_hours,
    minDeliveryDays: dto.min_delivery_days,
    requestedDeliveryDays: dto.requested_delivery_days,
    wallet: {
      balance: parseUsd(dto.wallet.balance_usd),
      shortfall: parseUsd(dto.wallet.shortfall_usd),
      isSufficient: dto.wallet.is_sufficient,
    },
    contractTerms: dto.contract_terms,
    blockers: (dto.blockers ?? []).map(mapDealBlocker),
    windows: mapWindows(dto.windows),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Field keys of a 422 (`lines.0.rate_card_id`, `requested_delivery_days`), from the error envelope. */
export const readErrorFields = (details: unknown): string[] =>
  isRecord(details) && isRecord(details.errors) ? Object.keys(details.errors) : [];

/** Line indexes a 422 says can't be offered any more (a rate card hidden or deleted meanwhile). */
export const readUnavailableLines = (details: unknown): number[] =>
  readErrorFields(details).flatMap(field => {
    const match = /^lines\.(\d+)\.rate_card_id$/.exec(field);
    return match ? [Number(match[1])] : [];
  });

/** `deal_offer_exists` from a save / send may name the open offer in `meta.deal_id`. */
export const readBlockerDealId = (details: unknown): string | null =>
  isRecord(details) && isRecord(details.meta) && typeof details.meta.deal_id === 'string'
    ? details.meta.deal_id
    : null;

/**
 * `409 deal_price_changed` carries the fresh quote in `meta.quote` (the draft was already
 * repriced). `null` when it's missing or unreadable: the screen re-quotes instead.
 */
export const readPriceChangedQuote = (details: unknown): DealQuote | null => {
  if (!isRecord(details) || !isRecord(details.meta) || !isRecord(details.meta.quote)) return null;
  try {
    return mapDealQuote(details.meta.quote as unknown as DealQuoteDto);
  } catch {
    return null;
  }
};

const toBriefDto = ({ hashtags, mentions, talkingPoints, donts, promoCode, trackingLink }: DealOfferInput['brief']): DealBriefDto => ({
  hashtags,
  mentions,
  talking_points: talkingPoints,
  donts,
  promo_code: promoCode,
  tracking_link: trackingLink,
});

export const toDealOfferBody = (offer: DealOfferInput): DealOfferBodyDto => ({
  lines: offer.lines.map(line => ({
    rate_card_id: line.rateCardId,
    quantity: line.quantity,
    addons: [...line.addons],
  })),
  shipping_mode: offer.shippingMode,
  requested_delivery_days: offer.requestedDeliveryDays,
  brief: toBriefDto(offer.brief),
});

export const toPreflightParams = (args: DealPreflightArgs): Record<string, string> =>
  'creatorSlug' in args
    ? { creator_slug: args.creatorSlug }
    : { influencer_profile_id: args.influencerProfileId };

/** The line total shown before a quote lands is never computed here: `null` until the server prices it. */
export const quoteLineTotal = (quote: DealQuote | null, rateCardId: string): Money | null =>
  quote?.lines.find(line => line.rateCardId === rateCardId)?.total ?? null;
