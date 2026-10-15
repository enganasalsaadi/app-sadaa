import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import type { SegmentedOption } from '@/shared/ui';
import { useGetDealsInfiniteQuery } from '../api/dealsApi';
import type { DealListTab, DealListTabDef } from '../constants/dealList';
import type { Deal, DealRole } from '../types';
import { isDealOnYou } from '../utils/dealNextStep';

type Navigation = DealsStackScreenProps<'Deals'>['navigation'];

/** Every role has exactly three tabs; one query each, so counts and tab switches are instant. */
export type DealTabs<T extends DealListTab> = readonly [T, T, T];

interface Options<T extends DealListTab> {
  role: DealRole;
  tabs: DealTabs<T>;
  defs: Record<T, DealListTabDef>;
  /** Tabs whose deals can be «your turn». */
  turnTabs: readonly T[];
}

const useTabQuery = (role: DealRole, def: DealListTabDef) =>
  useGetDealsInfiniteQuery(
    { role, statuses: def.statuses },
    { refetchOnMountOrArgChange: 30 },
  );

const soonestFirst = (a: Deal, b: Deal) =>
  (a.dueAt ?? Number.POSITIVE_INFINITY) - (b.dueAt ?? Number.POSITIVE_INFINITY);

/**
 * One role's deal list (handoff M3): three status tabs, each its own infinite query (the
 * server filters by `status[]`), the «your turn» stack worked out here from what the server sent
 * (a UX hint, rule 06), and pull to refresh all tabs.
 */
export const useDealsList = <T extends DealListTab>({
  role,
  tabs,
  defs,
  turnTabs,
}: Options<T>) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const [tab, setTab] = useState<T>(tabs[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const first = useTabQuery(role, defs[tabs[0]]);
  const second = useTabQuery(role, defs[tabs[1]]);
  const third = useTabQuery(role, defs[tabs[2]]);
  const queryOf = useCallback(
    (key: T) => [first, second, third][tabs.indexOf(key)] ?? first,
    [first, second, tabs, third],
  );
  const query = queryOf(tab);
  const countOf = useCallback(
    (key: T) => queryOf(key).data?.pages[0]?.meta.total ?? 0,
    [queryOf],
  );

  const pagesOf = useCallback(
    (key: T) => queryOf(key).data?.pages.flatMap(page => page.items) ?? [],
    [queryOf],
  );
  const deals = useMemo(() => pagesOf(tab), [pagesOf, tab]);

  const turn = useMemo(
    () =>
      turnTabs
        .flatMap(key => pagesOf(key))
        .filter(deal => isDealOnYou(deal, role))
        .sort(soonestFirst),
    [pagesOf, role, turnTabs],
  );

  const options: SegmentedOption<T>[] = useMemo(
    () =>
      tabs.map(key => {
        const total = countOf(key);
        const label = t(defs[key].label);
        return {
          value: key,
          label:
            total > 0
              ? t('marketplace.deals.tabCount', { label, count: total })
              : label,
        };
      }),
    [countOf, defs, t, tabs],
  );

  const firstRefetch = first.refetch;
  const secondRefetch = second.refetch;
  const thirdRefetch = third.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([firstRefetch(), secondRefetch(), thirdRefetch()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [firstRefetch, secondRefetch, thirdRefetch]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = query;
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openDeal = useCallback(
    (id: string) => navigation.navigate('DealDetail', { id }),
    [navigation],
  );
  const openGuide = useCallback(
    () => navigate('DealGuide', { role, context: 'general' }),
    [role],
  );

  const def = defs[tab];
  const activeCount = turnTabs.reduce((sum, key) => sum + countOf(key), 0);

  return {
    role,
    tab,
    setTab,
    options,
    deals,
    turn,
    activeCount,
    countOf,
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
    emptyTitle: t(def.emptyTitle),
    emptyHint: t(def.emptyHint),
    navigation,
  };
};
