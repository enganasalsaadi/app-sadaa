import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowUpRight, ListFilter } from 'lucide-react-native';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useGetWithdrawalsInfiniteQuery } from '../../../api/withdrawalApi';
import type { StatusChip } from '../../../components/StatusFilterChips';
import { WITHDRAWAL_FILTERS, WITHDRAWAL_STATUS_LOOK } from '../../../constants/withdraw';
import { WITHDRAWAL_STATUS } from '../../../types';
import type { Withdrawal, WithdrawalFilters, WithdrawalStatus } from '../../../types';
import { isOneOf } from '../../../utils/walletMappers';
import { groupByDay, type LedgerDay } from '../../../utils/walletDates';

type Navigation = WalletStackScreenProps<'Withdrawals'>['navigation'];
type Route = WalletStackScreenProps<'Withdrawals'>['route'];

export type WithdrawalsItem =
  | { kind: 'day'; key: string; day: LedgerDay<Withdrawal> }
  | { kind: 'more'; key: 'more' }
  | { kind: 'end'; key: 'end' };

const ALL = 'all';
const MORE_ITEM: WithdrawalsItem = { kind: 'more', key: 'more' };
const END_ITEM: WithdrawalsItem = { kind: 'end', key: 'end' };
const createdAt = (withdrawal: Withdrawal) => withdrawal.created_at;

/**
 * Withdrawal history (creator): every request newest first, grouped by day, filtered by
 * one status (opened pre-filtered from the hero's "in transfer" tile). A row opens it.
 */
export const useWithdrawalsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const initial = useRoute<Route>().params?.status;
  const [status, setStatus] = useState<WithdrawalStatus | null>(initial ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unset keys stay out, so "all" keeps one cache entry.
  const filters = useMemo<WithdrawalFilters>(() => (status ? { status } : {}), [status]);
  const { currentData, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useGetWithdrawalsInfiniteQuery(filters);

  const pages = currentData?.pages;
  const withdrawals = useMemo(() => pages?.flatMap(page => page.items) ?? [], [pages]);
  const days = useMemo(() => groupByDay(withdrawals, createdAt, new Date()), [withdrawals]);

  const items = useMemo<WithdrawalsItem[]>(() => {
    const dayItems = days.map<WithdrawalsItem>(day => ({ kind: 'day', key: day.key, day }));
    if (dayItems.length === 0) return dayItems;
    if (isFetchingNextPage) return [...dayItems, MORE_ITEM];
    return hasNextPage ? dayItems : [...dayItems, END_ITEM];
  }, [days, hasNextPage, isFetchingNextPage]);

  const chips = useMemo<StatusChip[]>(
    () => [
      { value: ALL, label: t('finance.withdraw.history.all') },
      ...WITHDRAWAL_FILTERS.map(value => ({ value, label: t(WITHDRAWAL_STATUS_LOOK[value].labelKey) })),
    ],
    [t],
  );

  const onSelectStatus = useCallback((value: string) => {
    setStatus(isOneOf(WITHDRAWAL_STATUS, value) ? value : null);
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

  const openWithdrawal = useCallback(
    (id: string) => navigation.navigate('WithdrawalDetail', { id }),
    [navigation],
  );
  const newWithdrawal = useCallback(() => navigation.navigate('Withdraw'), [navigation]);

  const filtered = status !== null;
  const emptyAction = useMemo(
    () =>
      filtered
        ? { label: t('finance.withdraw.history.showAll'), onPress: showAll, variant: 'secondary' as const }
        : { label: t('finance.withdraw.history.new'), onPress: newWithdrawal },
    [filtered, newWithdrawal, showAll, t],
  );

  return {
    title: t('finance.withdraw.history.title'),
    filtersLabel: t('finance.withdraw.history.filtersA11y'),
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
    openWithdrawal,
    emptyMessage: t(filtered ? 'finance.withdraw.history.filteredEmptyTitle' : 'finance.withdraw.history.emptyTitle'),
    emptyDescription: filtered ? undefined : t('finance.withdraw.history.emptyMessage'),
    emptyAction,
    emptyIcon: filtered ? ListFilter : ArrowUpRight,
  };
};

export type WithdrawalsScreenModel = ReturnType<typeof useWithdrawalsScreen>;
