import { parseAmountText } from '@/core/money';
import type {
  CampaignMoneyBreakdown,
  CampaignPricingModel,
  CampaignQuote,
} from '../types/campaign';
import type { CampaignDraftValues } from '../types/campaignDraft';

/**
 * What choosing a pricing model clears: the server keeps one model's fields only and refuses
 * both together (`campaign_pricing_conflict`); a budget goes with bidding alone.
 */
export const pricingModelPatch = (
  current: CampaignPricingModel | null,
  next: CampaignPricingModel,
): Partial<CampaignDraftValues> => {
  if (current === next) return {};
  return next === 'fixed'
    ? { pricingModel: 'fixed', bidMin: '', bidMax: '', budget: '' }
    : { pricingModel: 'bidding', seatPrice: '' };
};

/** The amount that binds the brand per seat: the fixed price, or the bid ceiling. */
const bindingSeatText = (values: Pick<CampaignDraftValues, 'pricingModel' | 'seatPrice' | 'bidMax'>): string =>
  values.pricingModel === 'bidding' ? values.bidMax : values.seatPrice;

/**
 * The quote's per-seat split (gross, fee, the creator's net) when it was worked out for the price
 * on screen; `null` while a newer price is still being saved, so a stale net is never shown.
 */
export const quoteSeatFor = (
  quote: CampaignQuote | undefined,
  values: Pick<CampaignDraftValues, 'pricingModel' | 'seatPrice' | 'bidMax'>,
): CampaignMoneyBreakdown | null => {
  const seat = quote?.seat.max;
  if (!seat || quote.pricingModel !== values.pricingModel) return null;
  const typed = parseAmountText(bindingSeatText(values), 'USD');
  return typed && typed.amount === seat.gross.amount ? seat : null;
};
