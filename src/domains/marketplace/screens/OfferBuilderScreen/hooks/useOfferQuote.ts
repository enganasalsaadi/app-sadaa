import { useEffect, useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { normalizeApiError, type AppApiError } from '@/core/api';
import { useQuoteDealOfferQuery } from '../../../api/dealOfferApi';
import type { DealOfferInput, DealQuote, DealQuoteArgs } from '../../../types/dealOffer';

/** Long enough to fold a burst of taps (quantity, add-ons) into one price request. */
const QUOTE_DEBOUNCE_MS = 350;

export interface OfferQuoteState {
  /** Last server price, kept while a newer one loads; `null` before the first. */
  quote: DealQuote | null;
  /** The shown price is for an older offer (a request is pending or in flight). */
  isPricing: boolean;
  /** Failure of the latest request, for the screen to route (403 KYC, 422 lines). */
  error: AppApiError | null;
  /** Price the exact current offer again (after a 422 drops a line, before signing). */
  refetch: () => void;
}

/**
 * The live price of the offer being built: the same server quote the contract will carry.
 * Nothing is computed here; an empty offer has no price.
 */
export const useOfferQuote = (creatorSlug: string, offer: DealOfferInput, enabled: boolean): OfferQuoteState => {
  const key = JSON.stringify(offer);
  const [debouncedKey, setDebouncedKey] = useState(key);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKey(key), QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [key]);

  const args = useMemo<DealQuoteArgs | null>(() => {
    const parsed = JSON.parse(debouncedKey) as DealOfferInput;
    return parsed.lines.length > 0 ? { creatorSlug, offer: parsed } : null;
  }, [creatorSlug, debouncedKey]);

  const { data, error, isFetching, refetch } = useQuoteDealOfferQuery(enabled && args ? args : skipToken);
  const hasLines = offer.lines.length > 0;

  return {
    quote: hasLines ? (data ?? null) : null,
    isPricing: hasLines && (key !== debouncedKey || isFetching),
    error: error ? normalizeApiError(error) : null,
    refetch,
  };
};
