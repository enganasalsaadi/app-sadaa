import { useCallback, useRef } from 'react';
import { createIdempotentAction, normalizeApiError } from '@/core/api';
import type { AppApiError, IdempotentAction } from '@/core/api';
import { getPersistentDeviceId } from '@/core/notification';
import { toastService } from '@/core/toast';
import { useSelectCampaignApplicantMutation } from '../api/brandCampaignsApi';
import type { CampaignSelectResult } from '../types/campaign';
import { isCampaignConflictError } from '../utils/campaignAction';
import { isSelectRefusal } from '../utils/applicantSelect';

export type ApplicantSelectOutcome =
  | { ok: true; result: CampaignSelectResult }
  | { ok: false; error: AppApiError; refused: boolean };

/**
 * Selecting one applicant (contract §3.5): binding, so it signs with this device's id and one
 * idempotency key per applicant. The key survives a failed or timed-out try, and is dropped once
 * the server answers or refuses. A second hold while one is in flight gets the same answer. A
 * conflict toasts the server's words (the mutation refetches); a 422 was already toasted globally.
 */
export const useApplicantSelect = (campaignId: string) => {
  const [trigger, { isLoading }] = useSelectCampaignApplicantMutation();
  const intentRef = useRef<{ applicationId: string; action: IdempotentAction } | null>(null);
  const pendingRef = useRef<Promise<ApplicantSelectOutcome> | null>(null);

  const run = useCallback(
    (applicationId: string): Promise<ApplicantSelectOutcome> => {
      if (pendingRef.current) return pendingRef.current;
      if (intentRef.current?.applicationId !== applicationId) {
        intentRef.current = { applicationId, action: createIdempotentAction() };
      }
      const { action } = intentRef.current;
      const send = async (): Promise<ApplicantSelectOutcome> => {
        try {
          const deviceId = await getPersistentDeviceId();
          const result = await action.run(idempotencyKey =>
            trigger({ id: campaignId, applicationId, deviceId, idempotencyKey }).unwrap(),
          );
          return { ok: true, result };
        } catch (err) {
          const error = normalizeApiError(err);
          const refused = isSelectRefusal(error);
          if (refused) action.reset();
          if (isCampaignConflictError(error)) toastService.error(error.message);
          return { ok: false, error, refused };
        }
      };
      const pending = send().finally(() => {
        pendingRef.current = null;
      });
      pendingRef.current = pending;
      return pending;
    },
    [trigger, campaignId],
  );

  return { run, isRunning: isLoading };
};
