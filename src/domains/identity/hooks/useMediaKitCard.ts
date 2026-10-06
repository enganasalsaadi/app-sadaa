import { useCallback, useMemo } from 'react';
import { useLookupItems } from '@/core/api';
import {
  useGetMediaKitQuery,
  useGetMediaKitStatsQuery,
} from '../api/mediaKitApi';
import type { MediaKitCardProps } from '../components/MediaKitCard';
import type { StatsPeriod } from '../types/mediaKit';
import { buildMediaKitTiles, labelNiches } from '../utils/mediaKitCard';
import { useMediaKitShareActions } from './useMediaKitShareActions';

/** Home shows the last 30 days; the Insights screen owns the 7d / 90d switch. */
export const HOME_STATS_PERIOD: StatsPeriod = '30d';

type MediaKitCardModel = Omit<
  MediaKitCardProps,
  'onOpenInsights' | 'onOpenPreview'
>;

/**
 * Everything the Home `MediaKitCard` needs: kit, 30-day stats, localised niches
 * and the share / copy / make-public triggers (contract §17.1, §17.6, §17.7).
 */
export const useMediaKitCard = (): MediaKitCardModel => {
  const kitQuery = useGetMediaKitQuery();
  const statsQuery = useGetMediaKitStatsQuery(HOME_STATS_PERIOD);
  const { items: nicheOptions } = useLookupItems('niches');
  const share = useMediaKitShareActions();

  const { data: kit, refetch: refetchKit } = kitQuery;
  const { data: stats, refetch: refetchStats } = statsQuery;

  const tiles = useMemo(
    () => (stats ? buildMediaKitTiles(stats) : []),
    [stats],
  );
  const nicheLabels = useMemo(
    () => labelNiches(kit?.preview.niches ?? [], nicheOptions),
    [kit?.preview.niches, nicheOptions],
  );

  const onRetry = useCallback(() => {
    refetchKit();
  }, [refetchKit]);
  const onRetryStats = useCallback(() => {
    refetchStats();
  }, [refetchStats]);

  return {
    status: kit ? 'ready' : kitQuery.isError ? 'error' : 'loading',
    preview: kit?.preview,
    link: kit?.public_url,
    nicheLabels,
    stats: {
      status: stats ? 'ready' : statsQuery.isError ? 'error' : 'loading',
      tiles,
    },
    share,
    onRetry,
    onRetryStats,
  };
};
