import { normalizeApiError } from '@/core/api';
import type { AppApiError, IdempotentAction } from '@/core/api';
import type { CampaignActionResult } from '../types/campaign';

/**
 * The campaign moved under the user (contract §1.3): any `409 campaign_*`. Show the server message
 * and refetch the campaign; never retry. Validation (422) and KYC (403) go back to the screen.
 */
export const isCampaignConflictError = ({ statusCode, code }: AppApiError): boolean =>
  statusCode === 409 && code !== null && code.startsWith('campaign_');

export type CampaignActionOutcome =
  | { ok: true; result: CampaignActionResult }
  | { ok: false; error: AppApiError; conflict: boolean };

/**
 * One tap of a campaign action. A conflict is reported (the mutation already refetches the
 * campaign) and drops the idempotency key: the user decides again on the new state. Every other
 * failure goes back to the screen.
 */
export const settleCampaignAction = async (
  send: (idempotencyKey?: string) => Promise<CampaignActionResult>,
  intent: IdempotentAction | null,
  notifyConflict: (error: AppApiError) => void,
): Promise<CampaignActionOutcome> => {
  try {
    const result = intent ? await intent.run(key => send(key)) : await send();
    return { ok: true, result };
  } catch (err) {
    const error = normalizeApiError(err);
    const conflict = isCampaignConflictError(error);
    if (conflict) {
      intent?.reset();
      notifyConflict(error);
    }
    return { ok: false, error, conflict };
  }
};
