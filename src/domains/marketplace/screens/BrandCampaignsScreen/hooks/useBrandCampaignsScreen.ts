import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EmptyStateAction } from '@/shared/ui';
import { CAMPAIGN_DRAFT_LIMIT } from '../../../constants/campaignList';
import { useCampaignDraftActions } from '../../../hooks/useCampaignDraftActions';
import { useCampaignsList } from '../../../hooks/useCampaignsList';
import type { CampaignAttention } from '../../../utils/campaignList';

/** Brand «My campaigns» (PC2.1): the four status tabs, the decision rail, and a draft's «⋯». */
export const useBrandCampaignsScreen = () => {
  const { t } = useTranslation();
  const list = useCampaignsList();
  const { tab, count, waitingApplications, draftsTotal, openCampaign, resumeDraft, openNewCampaign } = list;
  const drafts = useCampaignDraftActions(draftsTotal);

  const subtitle = useMemo(() => {
    if (count === null) return null;
    const waiting =
      waitingApplications !== null && waitingApplications > 0
        ? t('marketplace.campaign.list.waiting', { count: waitingApplications })
        : null;
    return [count, waiting].filter(Boolean).join(' • ');
  }, [count, t, waitingApplications]);

  const onAttention = useCallback(
    ({ campaign, kind }: CampaignAttention) =>
      kind === 'changes_requested' ? resumeDraft(campaign.id) : openCampaign(campaign.id),
    [openCampaign, resumeDraft],
  );

  const emptyAction: EmptyStateAction | undefined = useMemo(
    () =>
      tab === 'drafts' || tab === 'live'
        ? { label: t('marketplace.deals.newCampaign'), onPress: openNewCampaign }
        : undefined,
    [openNewCampaign, t, tab],
  );

  const draftsLimit =
    tab === 'drafts' && draftsTotal !== null && draftsTotal > 0
      ? t('marketplace.campaign.list.draftsLimit', { count: draftsTotal, max: CAMPAIGN_DRAFT_LIMIT })
      : null;

  return { ...list, drafts, subtitle, onAttention, emptyAction, draftsLimit };
};
