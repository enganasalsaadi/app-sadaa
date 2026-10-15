import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetCreatorDealSummaryQuery } from '../../../api/creatorDealSummaryApi';
import type { CreatorActiveDeal, CreatorDealSummary } from '../../../types';
import { splitCreatorDeals } from '../../../utils/creatorHomeDeals';
import type { HomeStackScreenProps } from '@/core/navigation';

type Navigation = HomeStackScreenProps<'CreatorHomeScreen'>['navigation'];

/**
 * The «your turn» section: a skeleton while the first read loads; nothing when it fails (the rest
 * of Home still works); a welcome before the first offer ever (`activeDeals` is `null`); a quiet
 * card when nothing waits on the creator; else the cards that do. Counts are the server's.
 */
export type CreatorHomeDeals =
  | { kind: 'hidden' }
  | { kind: 'loading' }
  | { kind: 'welcome' }
  | {
      kind: 'quiet';
      totalCount: number;
      nextUp: CreatorActiveDeal | null;
    }
  | {
      kind: 'deals';
      waiting: CreatorActiveDeal[];
      needsActionCount: number;
      movingCount: number;
    };

export const useCreatorHomeDeals = () => {
  const navigation = useNavigation<Navigation>();
  const { data, isError, refetch } = useGetCreatorDealSummaryQuery();

  // `initial: false` keeps the deals list under the deal, so back lands there.
  const openDeal = useCallback(
    (id: string) =>
      navigation.navigate('DealsTab', { screen: 'DealDetail', params: { id }, initial: false }),
    [navigation],
  );
  const openDeals = useCallback(() => navigation.navigate('DealsTab'), [navigation]);
  const openStrikes = useCallback(
    () => navigation.navigate('DealsTab', { screen: 'Strikes', initial: false }),
    [navigation],
  );

  const deals = useMemo((): CreatorHomeDeals => {
    if (!data) return isError ? { kind: 'hidden' } : { kind: 'loading' };
    const { activeDeals } = data;
    if (!activeDeals) return { kind: 'welcome' };
    const { waiting, nextUp } = splitCreatorDeals(activeDeals.items);
    const { needsActionCount, totalCount } = activeDeals;
    if (waiting.length === 0) return { kind: 'quiet', totalCount, nextUp };
    return {
      kind: 'deals',
      waiting,
      needsActionCount,
      movingCount: Math.max(0, totalCount - needsActionCount),
    };
  }, [data, isError]);

  const counts: CreatorDealSummary['counts'] | null = data?.counts ?? null;

  return { deals, counts, openDeal, openDeals, openStrikes, refresh: refetch };
};

export type CreatorHomeDealsModel = ReturnType<typeof useCreatorHomeDeals>;
