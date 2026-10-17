import { formatNumber } from '@/core/i18n';
import type { AppApiError } from '@/core/api';
import type { Money } from '@/core/money';
import { isCampaignConflictError } from './campaignAction';
import type { CampaignDeliverable } from '../types/campaign';

/** Where the wallet stands against the price of the pick; only the server's `funding` is final. */
export type SelectEstimate =
  | { kind: 'covers' }
  | { kind: 'short'; shortfall: Money }
  | { kind: 'unknown' };

/**
 * The «تقدير» on the confirm sheet (rule 06: a client preview, labelled): the price against the
 * balance the server last sent. The server may still hold less (other deals waiting for payment),
 * so the sheet never promises more than the escrow it reads back.
 */
export const selectEstimate = (balance: Money | null, price: Money): SelectEstimate => {
  if (!balance || balance.currency !== price.currency) return { kind: 'unknown' };
  if (balance.amount >= price.amount) return { kind: 'covers' };
  return { kind: 'short', shortfall: { amount: price.amount - balance.amount, currency: price.currency } };
};

/** «ريل ×1 · ستوري ×2»: what the creator delivers, as the campaign lists it. */
export const deliverablesSummary = (deliverables: readonly Pick<CampaignDeliverable, 'service' | 'count'>[]): string =>
  deliverables.map(item => `${item.service.label} ×${formatNumber(item.count)}`).join(' · ');

/** 422s that mean this applicant (or the budget) cannot take the pick as it stands; retrying the same tap cannot work. */
const SELECT_REFUSALS = ['campaign_budget_exceeded', 'campaign_applicant_unavailable'] as const;

/**
 * The pick was refused because the campaign or the card moved (a 409 `campaign_*`, the budget, the
 * applicant's accounts): the sheet closes on the refetched card instead of inviting the same hold.
 * Anything else (KYC, offline, a server fault) keeps the sheet for another try.
 */
export const isSelectRefusal = (error: AppApiError): boolean =>
  isCampaignConflictError(error) ||
  (error.statusCode === 422 && error.code !== null && (SELECT_REFUSALS as readonly string[]).includes(error.code));
