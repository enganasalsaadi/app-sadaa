import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { navigate } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useDeleteCampaignMutation } from '../api/brandCampaignsApi';
import { CAMPAIGN_DRAFT_LIMIT } from '../constants/campaignList';
import type { Campaign } from '../types';
import { isCampaignConflictError } from '../utils/campaignAction';
import { useCampaignAction } from './useCampaignAction';

type DraftStage = 'actions' | 'confirmDelete';

/**
 * What a draft's «⋯» offers: continue it, copy it (counts against the 20-draft cap) or delete it.
 * Delete asks first; a draft that stopped being one meanwhile (`campaign_not_draft`) shows the
 * server's words and the list refetches.
 */
export const useCampaignDraftActions = (draftsTotal: number | null) => {
  const { t } = useTranslation();
  const [target, setTarget] = useState<Campaign | null>(null);
  const [stage, setStage] = useState<DraftStage>('actions');
  const duplicateAction = useCampaignAction(target?.id ?? '');
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  const open = useCallback((campaign: Campaign) => {
    setStage('actions');
    setTarget(campaign);
  }, []);
  const close = useCallback(() => setTarget(null), []);
  const askDelete = useCallback(() => setStage('confirmDelete'), []);
  const backToActions = useCallback(() => setStage('actions'), []);

  const resume = useCallback(() => {
    if (!target) return;
    const { id } = target;
    setTarget(null);
    navigate('CampaignWizard', { campaignId: id, source: 'resume' });
  }, [target]);

  const duplicate = useCallback(async () => {
    if (!target) return;
    const outcome = await duplicateAction.run('duplicate');
    if (!outcome.ok) return;
    setTarget(null);
    navigate('CampaignWizard', { campaignId: outcome.result.campaign.id, source: 'duplicate' });
  }, [duplicateAction, target]);

  const confirmDelete = useCallback(async () => {
    if (!target || isDeleting) return;
    try {
      await deleteCampaign(target.id).unwrap();
      setTarget(null);
      toastService.success(t('marketplace.campaign.list.draftSheet.deleted'));
    } catch (err) {
      const error = normalizeApiError(err);
      if (isCampaignConflictError(error)) {
        setTarget(null);
        toastService.error(error.message);
      }
    }
  }, [deleteCampaign, isDeleting, t, target]);

  return {
    target,
    isActionsOpen: target !== null && stage === 'actions',
    isDeleteOpen: target !== null && stage === 'confirmDelete',
    atLimit: draftsTotal !== null && draftsTotal >= CAMPAIGN_DRAFT_LIMIT,
    isDuplicating: duplicateAction.isRunning,
    isDeleting,
    open,
    close,
    resume,
    duplicate,
    askDelete,
    backToActions,
    confirmDelete,
  };
};
