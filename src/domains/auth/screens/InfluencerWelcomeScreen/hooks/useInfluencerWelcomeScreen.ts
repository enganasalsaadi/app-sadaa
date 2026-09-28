import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, Vibration } from 'react-native';
import { useLookupItems } from '@/core/api';
import { useAppDispatch } from '@/core/store';
import { useGetInfluencerOnboardingProgressQuery } from '../../../api';
import { useFollowerTierOptions } from '../../../hooks/useFollowerTierOptions';
import { isFollowerTier, isInfluencerPlatform } from '../../../schemas';
import type { InfluencerPlatform } from '../../../schemas';
import { completeOnboarding } from '../../../store';

export const useInfluencerWelcomeScreen = () => {
  const dispatch = useAppDispatch();
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const tiers = useFollowerTierOptions();
  const nicheItems = useLookupItems('niches').items;
  const profile = progress?.profile;

  useEffect(() => {
    Vibration.vibrate(15);
    // Nothing to go back to: the wizard is finished server-side.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Server already confirmed completion; this only releases the session into
  // the main app (AppStatus → AUTHENTICATED).
  const onStart = useCallback(() => {
    dispatch(completeOnboarding());
  }, [dispatch]);

  // One orbit badge per linked platform, in the order the creator added them.
  const platforms = useMemo<InfluencerPlatform[]>(() => {
    const seen = new Set<InfluencerPlatform>();
    for (const entry of profile?.platforms ?? []) {
      if (isInfluencerPlatform(entry.platform)) seen.add(entry.platform);
    }
    return [...seen];
  }, [profile?.platforms]);

  // Niche ids → localized labels; unknown ids (lookups not loaded) are skipped.
  const niches = useMemo(() => {
    const labelById = new Map(nicheItems.map(item => [String(item.value), item.label]));
    return (profile?.niches ?? []).flatMap(id => {
      const label = labelById.get(String(id));
      return label ? [label] : [];
    });
  }, [nicheItems, profile?.niches]);

  const tier = progress?.calculated_influencer_tier;
  const knownTier = isFollowerTier(tier) ? tier : null;

  return {
    name: profile?.full_name?.trim() || null,
    tierLabel: knownTier ? tiers.labelOf(knownTier) : null,
    isTopTier: knownTier === 'MEGA',
    platforms,
    niches,
    hasRates: progress?.has_rate_card === true,
    onStart,
  };
};
