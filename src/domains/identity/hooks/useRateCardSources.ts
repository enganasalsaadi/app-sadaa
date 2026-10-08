import { useCallback, useMemo } from 'react';
import { useGetRateCardCatalogQuery } from '@/core/api';
import { buildRateServiceGroups } from '@/domains/auth';
import { useGetPlatformsQuery } from '../api/platformsApi';
import { useGetRateCardsQuery } from '../api/rateCardsApi';

/**
 * Everything the rate card screens read: the catalog, the creator's cards and
 * the service groups they may price (primary platform first, in person last).
 */
export const useRateCardSources = () => {
  const catalogQuery = useGetRateCardCatalogQuery();
  const platformsQuery = useGetPlatformsQuery();
  const cardsQuery = useGetRateCardsQuery();

  const catalog = catalogQuery.data;
  const platforms = platformsQuery.data;
  const cards = cardsQuery.data;

  const groups = useMemo(() => {
    if (!catalog || !platforms) return [];
    const linked = [...platforms]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      .map(platform => platform.platform);
    return buildRateServiceGroups(catalog, linked);
  }, [catalog, platforms]);

  const { refetch: refetchCatalog } = catalogQuery;
  const { refetch: refetchPlatforms } = platformsQuery;
  const { refetch: refetchCards } = cardsQuery;
  const refetch = useCallback(async () => {
    await Promise.allSettled([refetchCatalog(), refetchPlatforms(), refetchCards()]);
  }, [refetchCards, refetchCatalog, refetchPlatforms]);

  const queries = [catalogQuery, platformsQuery, cardsQuery];
  const failed = queries.find(query => query.isError && !query.data);

  return {
    catalog,
    platforms,
    cards,
    groups,
    isLoading: queries.some(query => query.isLoading),
    isError: !!failed,
    error: failed?.error,
    isFetching: queries.some(query => query.isFetching),
    refetch,
  };
};
