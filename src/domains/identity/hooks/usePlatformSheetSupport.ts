import { useCallback } from 'react';
import { useGetLookupsQuery } from '@/core/api';
import { useFollowerTierOptions, type InfluencerPlatform } from '@/domains/auth';

/** Server-driven inputs of `PlatformAccountSheet`: which platforms support a lookup, and the tiers. */
export const usePlatformSheetSupport = () => {
  const { data: lookups } = useGetLookupsQuery();
  const tiers = useFollowerTierOptions();
  const lookupPlatforms = lookups?.social_platforms;

  const supportsLookup = useCallback(
    (platform: InfluencerPlatform) =>
      lookupPlatforms?.find(entry => entry.id === platform)?.supports_lookup ?? false,
    [lookupPlatforms],
  );

  return { supportsLookup, tiers: tiers.options, tiersLoading: tiers.isLoading };
};
