import { useCallback, useRef } from 'react';
import { createIdempotentAction } from '@/core/api';
import type { ApiErrorCode, AppApiError, IdempotentAction } from '@/core/api';
import { toastService } from '@/core/toast';
import { useRunCampaignActionMutation } from '../api/brandCampaignsApi';
import type { CampaignActionPath, CampaignActionRequest } from '../types/campaign';
import { settleCampaignAction } from '../utils/campaignAction';
import type { CampaignActionOutcome } from '../utils/campaignAction';

export interface UseCampaignActionOptions {
  /** Binding / money-adjacent actions: a key survives retries of one intent (rule 06). */
  idempotent?: boolean;
  /** The app's own words for a conflict code; else the server message. */
  conflictCopy?: Partial<Record<ApiErrorCode, string>>;
}

/**
 * The one way a screen runs a brand campaign lifecycle action. Success replaces the cached
 * campaign with the server's; a `campaign_*` conflict toasts (the server message unless
 * `conflictCopy` has the code) and refetches. A second tap while one is in flight gets the same
 * answer instead of a second request; `isRunning` disables the button.
 */
export const useCampaignAction = (
  campaignId: string,
  { idempotent = false, conflictCopy }: UseCampaignActionOptions = {},
) => {
  const [trigger, { isLoading }] = useRunCampaignActionMutation();
  const copyRef = useRef(conflictCopy);
  copyRef.current = conflictCopy;
  const intentRef = useRef<IdempotentAction | null>(null);
  const pendingRef = useRef<Promise<CampaignActionOutcome> | null>(null);

  const run = useCallback(
    (path: CampaignActionPath, request: CampaignActionRequest = {}): Promise<CampaignActionOutcome> => {
      if (pendingRef.current) return pendingRef.current;
      if (idempotent) intentRef.current ??= createIdempotentAction();
      const send = (idempotencyKey?: string) =>
        trigger({
          id: campaignId,
          path,
          ...request,
          ...(idempotencyKey ? { idempotencyKey } : {}),
        }).unwrap();
      const notifyConflict = ({ code, message }: AppApiError) =>
        toastService.error((code && copyRef.current?.[code]) || message);
      const pending = settleCampaignAction(
        send,
        idempotent ? intentRef.current : null,
        notifyConflict,
      ).finally(() => {
        pendingRef.current = null;
      });
      pendingRef.current = pending;
      return pending;
    },
    [trigger, campaignId, idempotent],
  );

  /** The user started a different action (other seat count, new date): the next run gets a new key. */
  const resetIntent = useCallback(() => intentRef.current?.reset(), []);

  return { run, isRunning: isLoading, resetIntent };
};
