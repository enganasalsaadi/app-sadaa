import { useCallback, useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { parseAmountText, toAmountText } from '@/core/money';
import type { Money } from '@/core/money';
import { useGetCampaignQuoteQuery } from '../../../api/brandCampaignsApi';
import { CAMPAIGN_MONEY_LIMITS } from '../../../constants/campaignMoney';
import type { CampaignPricingModel } from '../../../types/campaign';
import type { CampaignDraftValues, CampaignWizardStep } from '../../../types/campaignDraft';
import type { CampaignDraftSyncState } from '../../../utils/campaignDraftSync';
import { pricingModelPatch, quoteSeatFor } from '../../../utils/campaignPricing';
import { refusalFieldMessage, refusalLeftover, refusalMessage } from '../../../utils/campaignWizard';

const PRICE_FIELDS = ['seat_price_usd', 'bid_min_usd', 'bid_max_usd', 'budget_usd'] as const;

/** Steps that show the quote (the money step itself, and the dock total on the review). */
const QUOTE_STEPS: readonly CampaignWizardStep[] = ['money', 'review'];

const amountText = (money: Money | null): string => (money ? toAmountText(money) : '');

/**
 * Step 3's money half: fixed price or bidding (switching clears the other), the optional budget
 * (bidding only), the seats, and the server's quote of the saved draft. The quote follows the
 * autosave: each saved price, seats or deliverables change refetches it, so it never runs per key.
 */
export const useCampaignMoney = (
  values: CampaignDraftValues,
  edit: (patch: Partial<CampaignDraftValues>) => void,
  refused: CampaignDraftSyncState['refused'],
  campaignId: string | null,
  step: CampaignWizardStep,
) => {
  const quoteQuery = useGetCampaignQuoteQuery(
    campaignId !== null && QUOTE_STEPS.includes(step) ? campaignId : skipToken,
    // The wallet may have been topped up since: read again whenever the step opens.
    { refetchOnMountOrArgChange: true },
  );

  // A fresh draft has no model yet; it reads as fixed, which the first price then saves.
  const model: CampaignPricingModel = values.pricingModel ?? 'fixed';

  const chooseModel = useCallback(
    (next: CampaignPricingModel) => edit(pricingModelPatch(values.pricingModel, next)),
    [edit, values.pricingModel],
  );

  const seatPrice = useMemo(() => parseAmountText(values.seatPrice, 'USD'), [values.seatPrice]);
  const bidMin = useMemo(() => parseAmountText(values.bidMin, 'USD'), [values.bidMin]);
  const bidMax = useMemo(() => parseAmountText(values.bidMax, 'USD'), [values.bidMax]);
  const budget = useMemo(() => parseAmountText(values.budget, 'USD'), [values.budget]);

  const setSeatPrice = useCallback(
    (money: Money | null) => edit({ pricingModel: 'fixed', seatPrice: amountText(money) }),
    [edit],
  );
  const setBidMin = useCallback((money: Money | null) => edit({ bidMin: amountText(money) }), [edit]);
  const setBidMax = useCallback((money: Money | null) => edit({ bidMax: amountText(money) }), [edit]);
  const setBudget = useCallback((money: Money | null) => edit({ budget: amountText(money) }), [edit]);
  const setSeats = useCallback((seatsTotal: number) => edit({ seatsTotal }), [edit]);

  const quote = quoteQuery.data;
  const seatSplit = useMemo(() => quoteSeatFor(quote, values), [quote, values]);
  const pricing = refused.pricing;

  return {
    model,
    chooseModel,
    seatPrice,
    setSeatPrice,
    bidMin,
    setBidMin,
    bidMax,
    setBidMax,
    budget,
    setBudget,
    seats: values.seatsTotal,
    setSeats,
    limits: CAMPAIGN_MONEY_LIMITS,
    quote,
    /** The per-seat split for the price on screen (`null` while a newer one is saving). */
    seatSplit,
    quoteLoading: quoteQuery.isLoading,
    quoteUpdating: quoteQuery.isFetching && !quoteQuery.isLoading,
    quoteFailed: quoteQuery.isError && !quote,
    reloadQuote: quoteQuery.refetch,
    seatPriceError: refusalFieldMessage(pricing, ['seat_price_usd']),
    bidMinError: refusalFieldMessage(pricing, ['bid_min_usd']),
    bidMaxError: refusalFieldMessage(pricing, ['bid_max_usd']),
    budgetError: refusalFieldMessage(pricing, ['budget_usd']),
    pricingError: refusalLeftover(pricing, PRICE_FIELDS),
    seatsError: refusalMessage(refused.seats_total, ['seats_total']),
  };
};

export type CampaignMoneyModel = ReturnType<typeof useCampaignMoney>;
