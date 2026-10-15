import { useCallback, useRef } from 'react';
import { createIdempotentAction } from '@/core/api';
import type { ApiErrorCode, AppApiError, IdempotentAction } from '@/core/api';
import { toastService } from '@/core/toast';
import { useRunDealActionMutation } from '../api/dealsApi';
import type { DealActionPath, DealActionRequest, DealRef } from '../types/deal';
import { settleDealAction } from '../utils/dealAction';
import type { DealActionOutcome } from '../utils/dealAction';

export interface UseDealActionOptions {
  /** Money / binding actions (rule 06): accept, fund, cancel, upsells, extension approve. */
  idempotent?: boolean;
  /** The app's own words for a conflict code (e.g. «the offer has closed»); else the server message. */
  conflictCopy?: Partial<Record<ApiErrorCode, string>>;
}

/**
 * The one way a screen runs a deal action (handoff §0). Success replaces the cached deal with the
 * server's; a `deal_*` conflict toasts (the server message unless `conflictCopy` has the code) and
 * refetches. A second tap while one is in flight gets the same answer instead of a second request;
 * `isRunning` disables the button.
 */
export const useDealAction = (
  { role, id }: DealRef,
  { idempotent = false, conflictCopy }: UseDealActionOptions = {},
) => {
  const [trigger, { isLoading }] = useRunDealActionMutation();
  const copyRef = useRef(conflictCopy);
  copyRef.current = conflictCopy;
  const intentRef = useRef<IdempotentAction | null>(null);
  const pendingRef = useRef<Promise<DealActionOutcome> | null>(null);

  const run = useCallback(
    (
      path: DealActionPath,
      request: DealActionRequest = {},
    ): Promise<DealActionOutcome> => {
      if (pendingRef.current) return pendingRef.current;
      if (idempotent) intentRef.current ??= createIdempotentAction();
      const send = (idempotencyKey?: string) =>
        trigger({
          ref: { role, id },
          path,
          ...request,
          ...(idempotencyKey ? { idempotencyKey } : {}),
        }).unwrap();
      const notifyConflict = ({ code, message }: AppApiError) =>
        toastService.error((code && copyRef.current?.[code]) || message);
      const pending = settleDealAction(
        send,
        idempotent ? intentRef.current : null,
        notifyConflict,
      ).finally(() => {
        pendingRef.current = null;
      });
      pendingRef.current = pending;
      return pending;
    },
    [trigger, role, id, idempotent],
  );

  /** The user started a different action (new reason, other upsell): the next run gets a new key. */
  const resetIntent = useCallback(() => intentRef.current?.reset(), []);

  return { run, isRunning: isLoading, resetIntent };
};
