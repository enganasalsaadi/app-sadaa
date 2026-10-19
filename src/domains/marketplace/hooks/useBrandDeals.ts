import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetDealsInfiniteQuery } from '../api/dealsApi';
import {
  BRAND_DEAL_EXTRA_DEF,
  BRAND_DEAL_FILTERS,
  BRAND_DEAL_TAB_DEF,
  DEFAULT_BRAND_DEAL_FILTER,
  type BrandDealFilter,
  type BrandDealTab,
} from '../constants/dealList';
import type { Deal } from '../types';
import type { HubFilterOption } from '../types/hub';
import { needsFirst } from '../utils/hubList';
import { isDealOnYou } from '../utils/dealNextStep';

type Navigation = DealsStackScreenProps<'Deals'>['navigation'];

const DEF = { ...BRAND_DEAL_TAB_DEF, ...BRAND_DEAL_EXTRA_DEF };

const useFilterQuery = (filter: BrandDealTab | 'all', skip: boolean) =>
  useGetDealsInfiniteQuery(
    { role: 'brand', statuses: DEF[filter].statuses },
    { skip, refetchOnMountOrArgChange: 30 },
  );

const soonestFirst = (a: Deal, b: Deal) =>
  (a.dueAt ?? Number.POSITIVE_INFINITY) - (b.dueAt ?? Number.POSITIVE_INFINITY);
const onBrand = (deal: Deal) => isDealOnYou(deal, 'brand');

/**
 * The brand's direct requests face: one infinite query per status group (the server filters by
 * `status[]`), all read on entry so each chip shows its count; «all» is a fifth read the first time
 * it is opened. «Waiting on you» is worked out here from what the open groups sent (a UX hint,
 * rule 06) and feeds the face's badge.
 */
export const useBrandDeals = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const [filter, setFilterState] = useState<BrandDealFilter>(DEFAULT_BRAND_DEAL_FILTER);
  const [allOpened, setAllOpened] = useState(DEFAULT_BRAND_DEAL_FILTER === 'all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const waiting = useFilterQuery('waiting', false);
  const ongoing = useFilterQuery('ongoing', false);
  const drafts = useFilterQuery('drafts', false);
  const closed = useFilterQuery('closed', false);
  const all = useFilterQuery('all', !allOpened);

  const groupOf = useCallback(
    (key: BrandDealTab) => ({ waiting, ongoing, drafts, closed })[key],
    [closed, drafts, ongoing, waiting],
  );
  // «Waiting on you» is read from the groups that hold open deals, so it pages with `ongoing`.
  const query = filter === 'all' ? all : filter === 'onYou' ? ongoing : groupOf(filter);

  const onYou = useMemo(
    () =>
      [...(waiting.data?.pages ?? []), ...(ongoing.data?.pages ?? [])]
        .flatMap(page => page.items)
        .filter(onBrand)
        .sort(soonestFirst),
    [ongoing.data, waiting.data],
  );

  const deals = useMemo(() => {
    if (filter === 'onYou') return onYou;
    const items = query.data?.pages.flatMap(page => page.items) ?? [];
    return filter === 'all' ? needsFirst(items, onBrand) : items;
  }, [filter, onYou, query.data]);

  const setFilter = useCallback((next: BrandDealFilter) => {
    setFilterState(next);
    if (next === 'all') setAllOpened(true);
  }, []);

  const options: HubFilterOption<BrandDealFilter>[] = useMemo(() => {
    const totalOf = (key: BrandDealTab) => groupOf(key).data?.pages[0]?.meta.total ?? 0;
    return BRAND_DEAL_FILTERS.map(key => ({
      value: key,
      label: t(DEF[key].label),
      count:
        key === 'all'
          ? totalOf('waiting') + totalOf('ongoing') + totalOf('drafts') + totalOf('closed')
          : key === 'onYou'
            ? onYou.length
            : totalOf(key),
      attention: key === 'onYou' && onYou.length > 0,
    }));
  }, [groupOf, onYou.length, t]);

  const waitingRefetch = waiting.refetch;
  const ongoingRefetch = ongoing.refetch;
  const draftsRefetch = drafts.refetch;
  const closedRefetch = closed.refetch;
  const allRefetch = all.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        waitingRefetch(),
        ongoingRefetch(),
        draftsRefetch(),
        closedRefetch(),
        ...(allOpened ? [allRefetch()] : []),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [allOpened, allRefetch, closedRefetch, draftsRefetch, ongoingRefetch, waitingRefetch]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = query;
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openDeal = useCallback((id: string) => navigation.navigate('DealDetail', { id }), [navigation]);
  const openGuide = useCallback(() => navigate('DealGuide', { role: 'brand', context: 'general' }), []);
  const openExplore = useCallback(
    () => navigation.navigate('HomeTab', { screen: 'Explore', params: undefined }),
    [navigation],
  );

  const def = DEF[filter];
  return {
    filter,
    setFilter,
    options,
    deals,
    attentionCount: onYou.length,
    isLoading: !query.data && query.isFetching && !isRefreshing,
    isError: query.isError && !query.data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    openDeal,
    openGuide,
    openExplore,
    emptyTitle: t(def.emptyTitle),
    emptyHint: t(def.emptyHint),
  };
};
