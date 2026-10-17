import { normalizeApiError } from '@/core/api';
import type { AppApiError, IdempotentAction } from '@/core/api';
import { toastService } from '@/core/toast';
import type { DealActionResult } from '../types/deal';

/**
 * The deal moved under the user (handoff §0): any `409 deal_*`, plus the dispute `403 deal_*`.
 * Show the server message and refetch; never retry blindly.
 */
export const isDealConflictError = ({ statusCode, code }: AppApiError): boolean =>
  (statusCode === 409 || statusCode === 403) && code !== null && code.startsWith('deal_');

export type DealActionOutcome =
  | { ok: true; result: DealActionResult }
  | { ok: false; error: AppApiError; conflict: boolean };

/**
 * One tap of a deal action. A conflict is reported (the mutation already refetches
 * the deal) and drops the idempotency key: the user decides again on the new state. Every other
 * failure goes back to the screen (422 → fields, inline errors).
 */
export const settleDealAction = async (
  send: (idempotencyKey?: string) => Promise<DealActionResult>,
  intent: IdempotentAction | null,
  notifyConflict: (error: AppApiError) => void,
): Promise<DealActionOutcome> => {
  try {
    const result = intent ? await intent.run(key => send(key)) : await send();
    return { ok: true, result };
  } catch (err) {
    const error = normalizeApiError(err);
    const conflict = isDealConflictError(error);
    if (conflict) {
      intent?.reset();
      notifyConflict(error);
    }
    return { ok: false, error, conflict };
  }
};

/**
 * A write that doesn't answer the deal (retention, dispute) hit a `deal_*` conflict: the server
 * says why (its mutation already refetched the deal). `true` when it was one.
 */
export const toastDealConflict = (error: AppApiError): boolean => {
  if (!isDealConflictError(error)) return false;
  toastService.error(error.message);
  return true;
};

/**
 * Failures nobody else reports: 422 toasts in baseQuery, 403/5xx/offline have global UI. The one
 * 403 baseQuery lets through silently is `creator_restricted` (a lock the page didn't know yet):
 * say it in the server's words; the restrictions refetch and the dock turns into the lock bar.
 */
export const reportDealFailure = (error: AppApiError) => {
  if (
    error.statusCode === 400 ||
    error.statusCode === 404 ||
    error.statusCode === 409 ||
    error.code === 'creator_restricted'
  ) {
    toastService.error(error.message);
  }
};
