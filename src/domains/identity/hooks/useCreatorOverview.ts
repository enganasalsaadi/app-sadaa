import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/core/store';
import { selectUser, useGetProfileQuery, type KycStatus } from '@/domains/auth';
import { useGetUserProfileQuery } from '../api/accountApi';
import { useGetMediaKitQuery, useGetMediaKitStatsQuery } from '../api/mediaKitApi';
import { useGetPlatformsQuery } from '../api/platformsApi';
import { useGetRateCardsQuery } from '../api/rateCardsApi';
import { buildMetricTiles } from '../utils/mediaKitCard';
import { buildMissingSteps, pickNextStep } from '../utils/profileCompletion';
import { needsRateCards } from '../utils/rateCardNotice';
import { buildRateRows } from '../utils/rateRows';
import { HOME_STATS_PERIOD } from './useMediaKitCard';

/** The hero's 30-day KPIs, in display order after reach. */
const HERO_METRICS = ['profile_views', 'unique_brand_views'] as const;
type KpiStatus = 'loading' | 'error' | 'ready';

/** Followers across every linked account; `null` while none reports a count. */
const sumFollowers = (counts: readonly (number | null)[]): number | null =>
  counts.reduce<number | null>((sum, count) => (count == null ? sum : (sum ?? 0) + count), null);

/**
 * The creator's account at a glance for Home: who they are, what blocks them,
 * completion, platforms and prices. `refresh` re-reads every source Home shows,
 * the media kit card's included, and settles when all of them have.
 */
export const useCreatorOverview = () => {
  const user = useAppSelector(selectUser);
  // Keeps `/me` subscribed so `User` invalidations refresh the store.
  const me = useGetProfileQuery();
  const platformsQuery = useGetPlatformsQuery();
  const details = useGetUserProfileQuery();
  const kitQuery = useGetMediaKitQuery();
  const statsQuery = useGetMediaKitStatsQuery(HOME_STATS_PERIOD);
  const ratesQuery = useGetRateCardsQuery();

  const kycStatus: KycStatus = user?.kyc?.status ?? user?.kyc_status ?? 'unverified';
  const completion = user?.profile_completion;
  const percentage = completion?.percentage ?? 0;

  const nextStep = useMemo(
    () => pickNextStep(buildMissingSteps(completion?.steps ?? [], kycStatus, false)),
    [completion?.steps, kycStatus],
  );

  const platforms = useMemo(() => platformsQuery.data ?? [], [platformsQuery.data]);
  const reach = useMemo(() => sumFollowers(platforms.map(p => p.follower_count)), [platforms]);

  const metrics = useMemo(() => {
    const byKey = new Map(
      statsQuery.data ? buildMetricTiles(statsQuery.data, HERO_METRICS).map(tile => [tile.key, tile]) : [],
    );
    return {
      views: byKey.get('profile_views') ?? null,
      brandViews: byKey.get('unique_brand_views') ?? null,
    };
  }, [statsQuery.data]);
  const kpiStatus: KpiStatus = statsQuery.data ? 'ready' : statsQuery.isError ? 'error' : 'loading';

  const rateRows = useMemo(
    () => buildRateRows(ratesQuery.data ?? [], platforms),
    [ratesQuery.data, platforms],
  );

  const { refetch: refetchMe } = me;
  const { refetch: refetchPlatforms } = platformsQuery;
  const { refetch: refetchDetails } = details;
  const { refetch: refetchKit } = kitQuery;
  const { refetch: refetchStats } = statsQuery;
  const { refetch: refetchRates } = ratesQuery;

  const refresh = useCallback(async () => {
    await Promise.allSettled([
      refetchMe(),
      refetchPlatforms(),
      refetchDetails(),
      refetchKit(),
      refetchStats(),
      refetchRates(),
    ]);
  }, [refetchDetails, refetchKit, refetchMe, refetchPlatforms, refetchRates, refetchStats]);

  const retryPlatforms = useCallback(() => {
    refetchPlatforms();
  }, [refetchPlatforms]);
  const retryRates = useCallback(() => {
    refetchRates();
  }, [refetchRates]);
  const retryStats = useCallback(() => {
    refetchStats();
  }, [refetchStats]);

  // Reach comes from platforms, the rest from the 30-day media kit stats.
  const reachLoading = platformsQuery.isLoading;
  const kpis = useMemo(
    () => ({ reach, reachLoading, ...metrics, status: kpiStatus, retry: retryStats }),
    [kpiStatus, metrics, reach, reachLoading, retryStats],
  );

  return {
    displayName: user?.display_name || user?.full_name || '',
    avatarUrl: user?.avatar_url ?? details.data?.avatar_url ?? null,
    tier: user?.influencer_tier ?? null,
    primaryPlatform: user?.primary_platform ?? null,
    unreadNotifications: user?.unread_notifications_count ?? 0,
    kycStatus,
    isVerified: kycStatus === 'verified',
    platformsReviewStatus: user?.platforms_review_status ?? null,
    needsRateCards: needsRateCards(user),
    /** `null` until the kit has loaded: no "hidden" notice on a guess. */
    isKitPublic: kitQuery.data ? kitQuery.data.is_public : null,
    completion: {
      percentage,
      /** Shown only while `/me` reports a completion below 100%. */
      isVisible: completion != null && percentage < 100,
      nextStep,
    },
    platforms: {
      items: platforms,
      isLoading: platformsQuery.isLoading,
      isError: platformsQuery.isError && !platformsQuery.data,
      retry: retryPlatforms,
    },
    kpis,
    rates: {
      rows: rateRows,
      isLoading: ratesQuery.isLoading,
      isError: ratesQuery.isError && !ratesQuery.data,
      retry: retryRates,
    },
    refresh,
  };
};

export type CreatorOverview = ReturnType<typeof useCreatorOverview>;
