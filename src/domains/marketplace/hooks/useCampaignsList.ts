import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignsInfiniteQuery } from '../api/brandCampaignsApi';
import {
  CAMPAIGN_FILTERS,
  CAMPAIGN_FILTER_DEF,
  DEFAULT_CAMPAIGN_FILTER,
  type CampaignFilter,
} from '../constants/campaignList';
import type { Campaign, CampaignPage } from '../types';
import type { HubFilterOption } from '../types/hub';
import { campaignAttentionKind, countCampaignAttention } from '../utils/campaignList';
import { needsFirst } from '../utils/hubList';

type Navigation = DealsStackScreenProps<'Deals'>['navigation'];

const useFilterQuery = (filter: CampaignFilter, skip: boolean) =>
  useGetCampaignsInfiniteQuery(
    { statuses: [...CAMPAIGN_FILTER_DEF[filter].statuses] },
    { skip, refetchOnMountOrArgChange: 30 },
  );

interface Paged {
  pages: readonly CampaignPage<Campaign>[];
}

const itemsOf = (data: Paged | undefined): Campaign[] => data?.pages.flatMap(page => page.items) ?? [];
const totalOf = (data: Paged | undefined): number | null => data?.pages[0]?.meta.total ?? null;
const waitsOnBrand = (campaign: Campaign) => campaignAttentionKind(campaign) !== null;

/**
 * The brand's public campaigns face: one infinite query per status group, all read on entry so
 * every chip shows its count; «all» is a fifth query read the first time the chip is opened. What
 * waits on the brand (suspended, a freed seat, edits asked for) comes first and is counted for the
 * face's badge. `enabled` is false while Public Campaigns are off: nothing is fetched.
 */
export const useCampaignsList = (enabled: boolean) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const [filter, setFilterState] = useState<CampaignFilter>(DEFAULT_CAMPAIGN_FILTER);
  const [allOpened, setAllOpened] = useState(DEFAULT_CAMPAIGN_FILTER === 'all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const live = useFilterQuery('live', !enabled);
  const review = useFilterQuery('review', !enabled);
  const drafts = useFilterQuery('drafts', !enabled);
  const finished = useFilterQuery('finished', !enabled);
  const all = useFilterQuery('all', !enabled || !allOpened);

  const queryOf = useCallback(
    (key: CampaignFilter) => ({ all, live, review, drafts, finished })[key],
    [all, drafts, finished, live, review],
  );
  const query = queryOf(filter);
  const campaigns = useMemo(() => needsFirst(itemsOf(query.data), waitsOnBrand), [query.data]);

  const setFilter = useCallback((next: CampaignFilter) => {
    setFilterState(next);
    if (next === 'all') setAllOpened(true);
  }, []);

  const attentionCount = useMemo(
    () => countCampaignAttention([...itemsOf(live.data), ...itemsOf(drafts.data)]),
    [drafts.data, live.data],
  );

  const options: HubFilterOption<CampaignFilter>[] = useMemo(() => {
    const totals = [live, review, drafts, finished].map(group => totalOf(group.data));
    const everything = totals.every(total => total !== null)
      ? totals.reduce<number>((sum, total) => sum + (total ?? 0), 0)
      : 0;
    return CAMPAIGN_FILTERS.map(key => {
      const group = key === 'all' ? null : queryOf(key);
      return {
        value: key,
        label: t(CAMPAIGN_FILTER_DEF[key].label),
        count: group === null ? everything : totalOf(group.data) ?? 0,
        attention: (key === 'live' || key === 'drafts') && itemsOf(queryOf(key).data).some(waitsOnBrand),
      };
    });
  }, [drafts, finished, live, queryOf, review, t]);

  const liveRefetch = live.refetch;
  const reviewRefetch = review.refetch;
  const draftsRefetch = drafts.refetch;
  const finishedRefetch = finished.refetch;
  const allRefetch = all.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        liveRefetch(),
        reviewRefetch(),
        draftsRefetch(),
        finishedRefetch(),
        ...(allOpened ? [allRefetch()] : []),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [allOpened, allRefetch, draftsRefetch, finishedRefetch, liveRefetch, reviewRefetch]);

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

  const def = CAMPAIGN_FILTER_DEF[filter];
  return {
    filter,
    setFilter,
    options,
    campaigns,
    attentionCount,
    draftsTotal: totalOf(drafts.data),
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
