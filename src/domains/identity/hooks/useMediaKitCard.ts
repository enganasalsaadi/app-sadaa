import { useCallback, useMemo } from 'react';
import { useGetMediaKitQuery, useGetMediaKitStatsQuery } from '../api/mediaKitApi';
import type { MediaKitCardShare, MediaKitCardStatus } from '../components/MediaKitShare';
import type { StatsPeriod } from '../types/mediaKit';
import { buildMediaKitTiles, formatLinkLabel, hasNoActivity } from '../utils/mediaKitCard';
import { useMediaKitShareActions } from './useMediaKitShareActions';

/** Home shows the last 30 days; the Insights screen owns the 7d / 90d switch. */
export const HOME_STATS_PERIOD: StatsPeriod = '30d';

export interface MediaKitCardModel {
  status: MediaKitCardStatus;
  /** `public_url` without its protocol (`sada.sy/c/anas`); unset while the kit loads. */
  linkLabel?: string;
  /** `null` until the kit has loaded. */
  isPublic: boolean | null;
  /** Nobody opened the kit in the last 30 days: Home nudges a first share. */
  noActivity: boolean;
  share: MediaKitCardShare;
  onRetry: () => void;
}

/**
 * Everything Home needs from the media kit: link, visibility, a no-activity nudge
 * and the share / copy / make-public triggers (contract §17.1, §17.6, §17.7).
 */
export const useMediaKitCard = (): MediaKitCardModel => {
  const kitQuery = useGetMediaKitQuery();
  const { data: stats } = useGetMediaKitStatsQuery(HOME_STATS_PERIOD);
  const share = useMediaKitShareActions();

  const { data: kit, isError, refetch: refetchKit } = kitQuery;

  const onRetry = useCallback(() => {
    refetchKit();
  }, [refetchKit]);

  const status: MediaKitCardStatus = kit ? 'ready' : isError ? 'error' : 'loading';
  const noActivity = useMemo(() => (stats ? hasNoActivity(buildMediaKitTiles(stats)) : false), [stats]);

  // Stable while nothing changed: Home's hero, pass and share bar are memoised on it.
  return useMemo(
    () => ({
      status,
      linkLabel: kit ? formatLinkLabel(kit.public_url) : undefined,
      isPublic: kit ? kit.is_public : null,
      noActivity,
      share,
      onRetry,
    }),
    [kit, noActivity, onRetry, share, status],
  );
};
