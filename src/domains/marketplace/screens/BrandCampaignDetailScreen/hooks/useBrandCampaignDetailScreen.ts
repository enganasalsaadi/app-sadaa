import { useCallback, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignHistoryQuery, useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import type { CampaignStatus } from '../../../types';
import { useClock } from '../../../hooks/useClock';
import { campaignBatchTools } from '../../../utils/campaignBatchTools';
import { campaignHistoryEvents, campaignTermsLocked, campaignTermsState } from '../../../utils/campaignDetail';
import { campaignJourney } from '../../../utils/campaignJourney';
import { campaignNow, type CampaignNowTodo } from '../../../utils/campaignNow';
import { campaignQuickActions, type CampaignQuickAction } from '../../../utils/campaignQuickActions';
import { getCampaignStatusMeta } from '../../../utils/campaignStatus';
import { useCampaignLifecycle } from './useCampaignLifecycle';

type Route = DealsStackScreenProps<'CampaignDetail'>['route'];
type Navigation = DealsStackScreenProps<'CampaignDetail'>['navigation'];

/** Statuses whose page leads with a checklist of what is missing and sends the brand back to the wizard. */
const DRAFT_STATUSES: readonly CampaignStatus[] = ['draft', 'changes_requested'];
/** Statuses the team's note explains (it stays on the campaign after the decision). */
const NOTE_STATUSES: readonly CampaignStatus[] = ['changes_requested', 'rejected', 'removed'];
/** Statuses with creators on the campaign: the dock opens their list. */
const CREATOR_STATUSES: readonly CampaignStatus[] = ['filled', 'closed'];
/** The page's clock: «time left» figures move by the minute. */
const MINUTE = 60_000;

export type CampaignDetailDock = 'resume' | 'resubmit' | 'reopen' | 'applicants' | 'creators';

/**
 * One campaign from the brand's side: its detail and its history (both re-read on open and by
 * pull-to-refresh), and what each section of the page says for the status. The wizard is the way
 * back into a draft; the «⋯» and the quick circles hold the lifecycle actions and the «now» card
 * the system's decisions (`useCampaignLifecycle`). The dock holds the one thing the status asks:
 * finish the draft, reopen, review the waiting applications, or open the chosen creators.
 */
export const useBrandCampaignDetailScreen = () => {
  const { id } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const detail = useGetCampaignQuery(id, { refetchOnMountOrArgChange: true });
  const history = useGetCampaignHistoryQuery(id, { refetchOnMountOrArgChange: true });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const now = useClock(MINUTE);

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

  const isDraft = statusKey !== null && DRAFT_STATUSES.includes(statusKey);
  const waiting = campaign?.counters.applicationsOpen ?? 0;
  const dock: { kind: CampaignDetailDock; count: number } | null = isDraft
    ? { kind: statusKey === 'changes_requested' ? 'resubmit' : 'resume', count: 0 }
    : statusKey === 'suspended'
      ? { kind: 'reopen', count: 0 }
      : statusKey === 'open' && waiting > 0
        ? { kind: 'applicants', count: waiting }
        : statusKey !== null && CREATOR_STATUSES.includes(statusKey) && (campaign?.counters.seatsOccupied ?? 0) > 0
          ? { kind: 'creators', count: 0 }
          : null;
  const reviewNote =
    campaign && statusKey !== null && NOTE_STATUSES.includes(statusKey) ? campaign.reviewNote : null;

  const dockKind = dock?.kind ?? null;
  const dockPress = useCallback(() => {
    switch (dockKind) {
      case 'reopen':
        decide('reopen');
        return;
      case 'applicants':
      case 'creators':
        openApplicants();
        return;
      case 'resume':
      case 'resubmit':
        openWizard();
        return;
      case null:
        return;
      default: {
        const _exhaustive: never = dockKind;
        return _exhaustive;
      }
    }
  }, [decide, dockKind, openApplicants, openWizard]);

  const quickActions = useMemo(() => (campaign ? campaignQuickActions(campaign, now) : []), [campaign, now]);
  const onQuickAction = useCallback(
    (action: CampaignQuickAction) => {
      switch (action) {
        case 'reopen':
          decide('reopen');
          return;
        case 'creators':
          openApplicants();
          return;
        default:
          lifecycle.chooseQuick(action);
      }
    },
    [decide, lifecycle, openApplicants],
  );

  const nowCard = useMemo(() => (campaign ? campaignNow(campaign, now) : null), [campaign, now]);
  const onTodo = useCallback(
    (todo: CampaignNowTodo) => {
      switch (todo.kind) {
        case 'applicants':
          openApplicants();
          return;
        case 'extend':
          lifecycle.chooseQuick('extendDeadline');
          return;
        case 'missing':
        case 'edit':
          openWizard();
          return;
        case 'decision':
          decide(todo.action);
          return;
        default: {
          const _exhaustive: never = todo;
          return _exhaustive;
        }
      }
    },
    [decide, lifecycle, openApplicants, openWizard],
  );

  const journey = useMemo(() => (campaign ? campaignJourney(campaign, now) : null), [campaign, now]);
  const termsState = campaign ? campaignTermsState(campaign) : 'static';
  const editTerms = useCallback(() => {
    if (isDraft) openWizard();
    else lifecycle.chooseQuick('edit');
  }, [isDraft, lifecycle, openWizard]);

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
    lifecycle,
    dock,
    dockPress,
    quickActions,
    onQuickAction,
    nowCard,
    onTodo,
    journey,
    reviewNote,
    tools: campaign ? campaignBatchTools(campaign) : null,
    termsState,
    editTerms,
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
