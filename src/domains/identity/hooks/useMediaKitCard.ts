import { useCallback } from 'react';
import { useGetMediaKitQuery, useGetMediaKitStatsQuery } from '../api/mediaKitApi';
import type { MediaKitCardProps } from '../components/MediaKitCard';
import type { StatsPeriod } from '../types/mediaKit';
import { buildMediaKitTiles, hasNoActivity } from '../utils/mediaKitCard';
import { useMediaKitShareActions } from './useMediaKitShareActions';

/** Home shows the last 30 days; the Insights screen owns the 7d / 90d switch. */
export const HOME_STATS_PERIOD: StatsPeriod = '30d';

type MediaKitCardModel = Omit<MediaKitCardProps, 'onOpenPreview'>;

/**
 * Everything the Home `MediaKitCard` needs: link, visibility, a no-activity nudge
 * and the share / copy / make-public triggers (contract §17.1, §17.6, §17.7).
 */
export const useMediaKitCard = (): MediaKitCardModel => {
  const kitQuery = useGetMediaKitQuery();
  const { data: stats } = useGetMediaKitStatsQuery(HOME_STATS_PERIOD);
  const share = useMediaKitShareActions();

  const { data: kit, refetch: refetchKit } = kitQuery;

  const onRetry = useCallback(() => {
    refetchKit();
  }, [refetchKit]);

  return {
    status: kit ? 'ready' : kitQuery.isError ? 'error' : 'loading',
    link: kit?.public_url,
    isPublic: kit ? kit.is_public : null,
    noActivity: stats ? hasNoActivity(buildMediaKitTiles(stats)) : false,
    share,
    onRetry,
  };
};
