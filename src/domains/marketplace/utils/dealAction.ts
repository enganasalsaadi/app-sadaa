import { normalizeApiError } from '@/core/api';
import type { AppApiError, IdempotentAction } from '@/core/api';
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
 * One tap of a deal action. A conflict shows the server message (the mutation already refetches
 * the deal) and drops the idempotency key: the user decides again on the new state. Every other
 * failure goes back to the screen (422 → fields, inline errors).
 */
export const settleDealAction = async (
  send: (idempotencyKey?: string) => Promise<DealActionResult>,
  intent: IdempotentAction | null,
  notifyConflict: (message: string) => void,
): Promise<DealActionOutcome> => {
  try {
    const result = intent ? await intent.run(key => send(key)) : await send();
    return { ok: true, result };
  } catch (err) {
    const error = normalizeApiError(err);
    const conflict = isDealConflictError(error);
    if (conflict) {
      intent?.reset();
      notifyConflict(error.message);
    }
    return { ok: false, error, conflict };
  }
};
