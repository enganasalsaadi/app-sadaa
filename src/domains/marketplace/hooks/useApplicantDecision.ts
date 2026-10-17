import { useCallback, useRef } from 'react';
import { normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import { useDecideCampaignApplicantMutation } from '../api/brandCampaignsApi';
import type { ApplicantDecision } from '../types/campaign';
import { isCampaignConflictError } from '../utils/campaignAction';

/**
 * Shortlist / reject one applicant. Resolves `true` once the server took it. A conflict (the 72 h
 * ran out, the campaign moved) or a vanished card toasts the server's message; the mutation has
 * already refetched the card, so the screen shows what is true now. A second tap while one is in
 * flight is ignored.
 */
export const useApplicantDecision = (campaignId: string, applicationId: string) => {
  const [trigger, { isLoading }] = useDecideCampaignApplicantMutation();
  const busy = useRef(false);

  const run = useCallback(
    async (decision: ApplicantDecision): Promise<boolean> => {
      if (busy.current) return false;
      busy.current = true;
      try {
        await trigger({ id: campaignId, applicationId, decision }).unwrap();
        return true;
      } catch (err) {
        const error = normalizeApiError(err);
        if (isCampaignConflictError(error) || error.statusCode === 404) toastService.error(error.message);
        return false;
      } finally {
        busy.current = false;
      }
    },
    [trigger, campaignId, applicationId],
  );

  return { run, isRunning: isLoading };
};
