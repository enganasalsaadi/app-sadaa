import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import type { SegmentedOption } from '@/shared/ui';
import { useGetCampaignsInfiniteQuery } from '../api/brandCampaignsApi';
import { CAMPAIGN_ATTENTION_STATUSES, CAMPAIGN_TAB_DEF, DEFAULT_CAMPAIGN_TAB } from '../constants/campaignList';
import { CAMPAIGN_TABS } from '../constants/campaignStatus';
import type { CampaignTab } from '../constants/campaignStatus';
import type { Campaign, CampaignPage } from '../types';
import { buildCampaignAttention, waitingApplications } from '../utils/campaignList';

type Navigation = DealsStackScreenProps<'Deals'>['navigation'];

const useTabQuery = (tab: CampaignTab, skip: boolean) =>
  useGetCampaignsInfiniteQuery(
    { statuses: [...CAMPAIGN_TAB_DEF[tab].statuses] },
    { skip, refetchOnMountOrArgChange: 30 },
  );

interface Paged {
  pages: readonly CampaignPage<Campaign>[];
}

const itemsOf = (data: Paged | undefined): Campaign[] => data?.pages.flatMap(page => page.items) ?? [];
const totalOf = (data: Paged | undefined): number | null => data?.pages[0]?.meta.total ?? null;

/**
 * The brand's «My campaigns» (PC2.1): one infinite query per status group. A tab is read only once
 * it has been opened (counts show on the tabs that have loaded, no four-way fetch on entry); the
 * live tab loads first, and a small query of its own reads the campaigns the admin sent back so
 * the «needs your decision» rail is right before the drafts tab was ever opened.
 */
export const useCampaignsList = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const [tab, setTabState] = useState<CampaignTab>(DEFAULT_CAMPAIGN_TAB);
  const [opened, setOpened] = useState<readonly CampaignTab[]>([DEFAULT_CAMPAIGN_TAB]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const drafts = useTabQuery('drafts', !opened.includes('drafts'));
  const review = useTabQuery('review', !opened.includes('review'));
  const live = useTabQuery('live', !opened.includes('live'));
  const finished = useTabQuery('finished', !opened.includes('finished'));
  const attention = useGetCampaignsInfiniteQuery(
    { statuses: [...CAMPAIGN_ATTENTION_STATUSES] },
    { refetchOnMountOrArgChange: 30 },
  );

  const queryOf = useCallback(
    (key: CampaignTab) => ({ drafts, review, live, finished })[key],
    [drafts, finished, live, review],
  );
  const query = queryOf(tab);
  const campaigns = useMemo(() => itemsOf(query.data), [query.data]);

  const setTab = useCallback((next: CampaignTab) => {
    setTabState(next);
    setOpened(current => (current.includes(next) ? current : [...current, next]));
  }, []);

  const options: SegmentedOption<CampaignTab>[] = useMemo(
    () =>
      CAMPAIGN_TABS.map(key => {
        const total = totalOf(queryOf(key).data);
        const label = t(CAMPAIGN_TAB_DEF[key].label);
        return {
          value: key,
          label: total ? t('marketplace.deals.tabCount', { label, count: total }) : label,
        };
      }),
    [queryOf, t],
  );

  const needsYou = useMemo(
    () => buildCampaignAttention([...itemsOf(live.data), ...itemsOf(attention.data)]),
    [attention.data, live.data],
  );

  const total = totalOf(query.data);
  const liveWaiting = tab === 'live' ? waitingApplications(campaigns, query.hasNextPage ?? false) : null;
  const draftsTotal = totalOf(drafts.data);

  const draftsRefetch = drafts.refetch;
  const reviewRefetch = review.refetch;
  const liveRefetch = live.refetch;
  const finishedRefetch = finished.refetch;
  const attentionRefetch = attention.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const refetchers = { drafts: draftsRefetch, review: reviewRefetch, live: liveRefetch, finished: finishedRefetch };
      await Promise.all([
        attentionRefetch(),
        ...opened.map(key => refetchers[key]()),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [attentionRefetch, draftsRefetch, finishedRefetch, liveRefetch, opened, reviewRefetch]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = query;
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openCampaign = useCallback((id: string) => navigation.navigate('CampaignDetail', { id }), [navigation]);
  const resumeDraft = useCallback((id: string) => navigate('CampaignWizard', { campaignId: id, source: 'resume' }), []);
  const openNewCampaign = useCallback(() => navigate('CampaignWizard'), []);

  const def = CAMPAIGN_TAB_DEF[tab];
  return {
    tab,
    setTab,
    options,
    campaigns,
    needsYou,
    count: total === null ? null : t(def.count, { count: total }),
    waitingApplications: liveWaiting,
    draftsTotal,
    isLoading: !query.data && query.isFetching && !isRefreshing,
    isError: query.isError && !query.data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    openCampaign,
    resumeDraft,
    openNewCampaign,
    emptyTitle: t(def.emptyTitle),
    emptyHint: t(def.emptyHint),
  };
};
