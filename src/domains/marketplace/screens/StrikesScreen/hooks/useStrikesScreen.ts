import { useCallback, useState } from 'react';
import { useGetDealStrikesQuery } from '../../../api/dealUpsellApi';
import { useClock } from '../../../hooks/useClock';

/** Days are the finest unit a strike counts in, so a coarse tick keeps «days left» honest without churn. */
const TICK_MS = 60_000;

/** The creator's active strikes (`GET /influencer/strikes`), read fresh on open and on pull. */
export const useStrikesScreen = () => {
  const { data, isFetching, error, refetch } = useGetDealStrikesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const now = useClock(TICK_MS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    strikes: data ?? null,
    now,
    isLoading: !data && isFetching,
    isRefreshing,
    error,
    onRefresh,
    onRetry,
  };
};
