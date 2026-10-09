import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ListFilter, Wallet } from 'lucide-react-native';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useGetTopUpsInfiniteQuery } from '../../../api/topUpApi';
import { TOP_UP_STATUS_LOOK } from '../../../constants/topUp';
import { TOP_UP_STATUS } from '../../../types';
import type { TopUp, TopUpFilters, TopUpStatus } from '../../../types';
import { isOneOf } from '../../../utils/walletMappers';
import { groupByDay, type LedgerDay } from '../../../utils/walletDates';
import type { StatusChip } from '../../../components/StatusFilterChips';

type Navigation = WalletStackScreenProps<'TopUps'>['navigation'];
type Route = WalletStackScreenProps<'TopUps'>['route'];

export type TopUpsItem =
  | { kind: 'day'; key: string; day: LedgerDay<TopUp> }
  | { kind: 'more'; key: 'more' }
  | { kind: 'end'; key: 'end' };

const ALL = 'all';
const MORE_ITEM: TopUpsItem = { kind: 'more', key: 'more' };
const END_ITEM: TopUpsItem = { kind: 'end', key: 'end' };
const submittedAt = (topUp: TopUp) => topUp.submitted_at;

/**
 * Top-up history (brand): every request newest first, grouped by day, filtered by one
 * status (opened pre-filtered from the hero's "in review" tile). A row opens its request.
 */
export const useTopUpsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const initial = useRoute<Route>().params?.status;
  const [status, setStatus] = useState<TopUpStatus | null>(initial ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unset keys stay out, so "all" keeps one cache entry.
  const filters = useMemo<TopUpFilters>(() => (status ? { status } : {}), [status]);
  const { currentData, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useGetTopUpsInfiniteQuery(filters);

  const pages = currentData?.pages;
  const topUps = useMemo(() => pages?.flatMap(page => page.items) ?? [], [pages]);
  const days = useMemo(() => groupByDay(topUps, submittedAt, new Date()), [topUps]);

  const items = useMemo<TopUpsItem[]>(() => {
    const dayItems = days.map<TopUpsItem>(day => ({ kind: 'day', key: day.key, day }));
    if (dayItems.length === 0) return dayItems;
    if (isFetchingNextPage) return [...dayItems, MORE_ITEM];
    return hasNextPage ? dayItems : [...dayItems, END_ITEM];
  }, [days, hasNextPage, isFetchingNextPage]);

  const chips = useMemo<StatusChip[]>(
    () => [
      { value: ALL, label: t('finance.topUp.history.all') },
      ...TOP_UP_STATUS.map(value => ({ value, label: t(TOP_UP_STATUS_LOOK[value].labelKey) })),
    ],
    [t],
  );

  const onSelectStatus = useCallback((value: string) => {
    setStatus(isOneOf(TOP_UP_STATUS, value) ? value : null);
  }, []);
  const showAll = useCallback(() => setStatus(null), []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openTopUp = useCallback((id: string) => navigation.navigate('TopUpDetail', { id }), [navigation]);
  const newTopUp = useCallback(() => navigation.navigate('TopUp'), [navigation]);

  const filtered = status !== null;
  const emptyAction = useMemo(
    () =>
      filtered
        ? { label: t('finance.topUp.history.showAll'), onPress: showAll, variant: 'secondary' as const }
        : { label: t('finance.topUp.history.new'), onPress: newTopUp },
    [filtered, newTopUp, showAll, t],
  );

  return {
    title: t('finance.topUp.history.title'),
    newLabel: t('finance.topUp.history.new'),
    filtersLabel: t('finance.topUp.history.filtersA11y'),
    newTopUp,
    chips,
    selectedStatus: status ?? ALL,
    onSelectStatus,
    items,
    isLoading: !currentData && isFetching && !isRefreshing,
    isError: isError && !currentData,
    isRefreshing,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    openTopUp,
    emptyMessage: t(filtered ? 'finance.topUp.history.filteredEmptyTitle' : 'finance.topUp.history.emptyTitle'),
    emptyDescription: filtered ? undefined : t('finance.topUp.history.emptyMessage'),
    emptyAction,
    emptyIcon: filtered ? ListFilter : Wallet,
  };
};

export type TopUpsScreenModel = ReturnType<typeof useTopUpsScreen>;
