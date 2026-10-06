import { useCallback, useMemo } from 'react';
import { useLookupItems } from '@/core/api';
import { useAppSelector } from '@/core/store';
import { selectUser, useGetProfileQuery, type KycStatus, type ServiceType } from '@/domains/auth';
import { useGetUserProfileQuery } from '../api/accountApi';
import { useGetMediaKitQuery, useGetMediaKitStatsQuery } from '../api/mediaKitApi';
import { useGetPlatformsQuery } from '../api/platformsApi';
import { buildMissingSteps, pickNextStep } from '../utils/profileCompletion';
import { buildRateRows } from '../utils/rateRows';
import { HOME_STATS_PERIOD } from './useMediaKitCard';

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
  const { items: serviceOptions } = useLookupItems('service_types');

  const kycStatus: KycStatus = user?.kyc?.status ?? user?.kyc_status ?? 'unverified';
  const completion = user?.profile_completion;
  const percentage = completion?.percentage ?? 0;

  const nextStep = useMemo(
    () => pickNextStep(buildMissingSteps(completion?.steps ?? [], kycStatus, false)),
    [completion?.steps, kycStatus],
  );

  const platforms = useMemo(() => platformsQuery.data ?? [], [platformsQuery.data]);

  const serviceLabel = useCallback(
    (service: ServiceType) => serviceOptions.find(item => item.value === service)?.label ?? service,
    [serviceOptions],
  );
  const rateRows = useMemo(
    () => buildRateRows(details.data?.profile.rate_cards ?? [], platforms, serviceLabel),
    [details.data?.profile.rate_cards, platforms, serviceLabel],
  );

  const { refetch: refetchMe } = me;
  const { refetch: refetchPlatforms } = platformsQuery;
  const { refetch: refetchDetails } = details;
  const { refetch: refetchKit } = kitQuery;
  const { refetch: refetchStats } = statsQuery;

  const refresh = useCallback(async () => {
    await Promise.allSettled([
      refetchMe(),
      refetchPlatforms(),
      refetchDetails(),
      refetchKit(),
      refetchStats(),
    ]);
  }, [refetchDetails, refetchKit, refetchMe, refetchPlatforms, refetchStats]);

  const retryPlatforms = useCallback(() => {
    refetchPlatforms();
  }, [refetchPlatforms]);
  const retryRates = useCallback(() => {
    refetchDetails();
  }, [refetchDetails]);

  return {
    displayName: user?.display_name || user?.full_name || '',
    avatarUrl: user?.avatar_url ?? details.data?.avatar_url ?? null,
    tier: user?.influencer_tier ?? null,
    primaryPlatform: user?.primary_platform ?? null,
    unreadNotifications: user?.unread_notifications_count ?? 0,
    kycStatus,
    platformsReviewStatus: user?.platforms_review_status ?? null,
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
    rates: {
      rows: rateRows,
      isLoading: details.isLoading,
      isError: details.isError && !details.data,
      retry: retryRates,
    },
    refresh,
  };
};

export type CreatorOverview = ReturnType<typeof useCreatorOverview>;
