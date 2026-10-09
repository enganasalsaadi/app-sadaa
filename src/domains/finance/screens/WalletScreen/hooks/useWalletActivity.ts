import { useCallback, useMemo } from 'react';
import { useGetWalletTransactionsInfiniteQuery } from '../../../api/walletApi';
import { WALLET_RECENT_LINES } from '../../../constants';
import { groupLinesByDay } from '../../../utils/walletDates';

export type ActivitySectionStatus = 'loading' | 'error' | 'empty' | 'ready';

/** No filters: the statement's unfiltered cache, so both screens share its first page. */
const ALL_LINES = {};

/** The latest lines grouped by day (today / yesterday / date); the statement has the rest. */
export const useWalletActivity = () => {
  const query = useGetWalletTransactionsInfiniteQuery(ALL_LINES);
  const { data, isError, refetch } = query;
  const firstPage = data?.pages[0]?.items;
  // More lines than the tab shows: the statement link reads "view full statement".
  const hasMore = (data?.pages[0]?.meta.total ?? 0) > WALLET_RECENT_LINES;

  const days = useMemo(
    () => (firstPage ? groupLinesByDay(firstPage.slice(0, WALLET_RECENT_LINES), new Date()) : []),
    [firstPage],
  );

  const status: ActivitySectionStatus = firstPage
    ? days.length > 0
      ? 'ready'
      : 'empty'
    : isError
      ? 'error'
      : 'loading';

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return { status, days, hasMore, retry, refetch };
};

export type WalletActivityModel = ReturnType<typeof useWalletActivity>;
