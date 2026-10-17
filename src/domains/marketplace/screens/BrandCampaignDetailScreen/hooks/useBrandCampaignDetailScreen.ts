import { useCallback, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignHistoryQuery, useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import type { CampaignStatus } from '../../../types';
import { campaignBatchTools } from '../../../utils/campaignBatchTools';
import { campaignHistoryEvents, campaignTermsLocked } from '../../../utils/campaignDetail';
import { getCampaignStatusMeta } from '../../../utils/campaignStatus';
import { useCampaignLifecycle } from './useCampaignLifecycle';

type Route = DealsStackScreenProps<'CampaignDetail'>['route'];
type Navigation = DealsStackScreenProps<'CampaignDetail'>['navigation'];

/** Statuses whose page leads with a checklist of what is missing and sends the brand back to the wizard. */
const DRAFT_STATUSES: readonly CampaignStatus[] = ['draft', 'changes_requested'];
/** Statuses the team's note explains (it stays on the campaign after the decision). */
const NOTE_STATUSES: readonly CampaignStatus[] = ['changes_requested', 'rejected', 'removed'];

export type CampaignDetailDock = 'resume' | 'resubmit' | 'reopen';

/**
 * One campaign from the brand's side: its detail and its history (both re-read on open and by
 * pull-to-refresh), and which sections the status calls for. The wizard is the way back into a
 * draft; the «⋯» holds the lifecycle actions and the island's buttons the system's decisions
 * (`useCampaignLifecycle`). A suspended campaign repeats its one-tap reopen in the dock.
 */
export const useBrandCampaignDetailScreen = () => {
  const { id } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const detail = useGetCampaignQuery(id, { refetchOnMountOrArgChange: true });
  const history = useGetCampaignHistoryQuery(id, { refetchOnMountOrArgChange: true });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const campaign = detail.data ?? null;
  const statusKey = campaign?.status.key ?? null;
  const events = useMemo(() => campaignHistoryEvents(history.data ?? []), [history.data]);

  const refetchCampaign = detail.refetch;
  const refetchHistory = history.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchCampaign(), refetchHistory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCampaign, refetchHistory]);
  const onRetry = useCallback(() => {
    refetchCampaign();
    refetchHistory();
  }, [refetchCampaign, refetchHistory]);
  const onRetryHistory = useCallback(() => {
    refetchHistory();
  }, [refetchHistory]);

  const openWizard = useCallback(() => navigate('CampaignWizard', { campaignId: id, source: 'resume' }), [id]);
  const openApplicants = useCallback(() => navigation.navigate('CampaignApplicants', { id }), [id, navigation]);
  const openDrop = useCallback(() => navigation.navigate('CampaignDrop', { id }), [id, navigation]);
  const openShipping = useCallback(() => navigation.navigate('CampaignShipping', { id }), [id, navigation]);
  const openAnnouncements = useCallback(() => navigation.navigate('CampaignAnnouncements', { id }), [id, navigation]);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const lifecycle = useCampaignLifecycle(campaign, goBack);
  const decide = lifecycle.decide;
  const reopenFromDock = useCallback(() => decide('reopen'), [decide]);

  const isDraft = statusKey !== null && DRAFT_STATUSES.includes(statusKey);
  const dock: CampaignDetailDock | null = isDraft
    ? statusKey === 'changes_requested'
      ? 'resubmit'
      : 'resume'
    : statusKey === 'suspended'
      ? 'reopen'
      : null;
  const reviewNote =
    campaign && statusKey !== null && NOTE_STATUSES.includes(statusKey) ? campaign.reviewNote : null;

  return {
    campaign,
    // Loading is the first read only; a refetch keeps the page on screen.
    isLoading: !campaign && detail.isFetching,
    error: detail.error,
    isRefreshing,
    onRefresh,
    onRetry,
    goBack,
    openWizard,
    openApplicants,
    openDrop,
    openShipping,
    openAnnouncements,
    reopenFromDock,
    lifecycle,
    dock,
    showReadiness: isDraft,
    reviewNote,
    tools: campaign ? campaignBatchTools(campaign) : null,
    termsLocked: campaign ? campaignTermsLocked(campaign) : false,
    history: {
      events,
      isLoading: !history.data && history.isFetching,
      isError: history.isError,
      endedBadly: campaign ? getCampaignStatusMeta(campaign.status.key).tone === 'danger' : false,
      onRetry: onRetryHistory,
    },
  };
};

export type BrandCampaignDetailModel = ReturnType<typeof useBrandCampaignDetailScreen>;
