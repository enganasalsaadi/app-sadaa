import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { HomeStackScreenProps } from '@/core/navigation';
import { useGetCreatorDealSummaryQuery } from '../../../api/creatorDealSummaryApi';
import type { CreatorCampaign } from '../../../types';

type Navigation = HomeStackScreenProps<'CreatorHomeScreen'>['navigation'];

/**
 * The «campaigns for you» strip: nothing while the deals summary is unread or its `campaigns` is
 * `null` (flag off; no skeleton, because the flag is unknown until it answers and a skeleton that
 * vanishes would flash for creators who don't have the feature). Otherwise the server's counts and
 * its first cards; with no card the strip shows a calm card (or only the chips).
 */
export type CreatorHomeCampaigns =
  | { kind: 'hidden' }
  | {
      kind: 'strip';
      feedCount: number;
      newInvites: number;
      openApplications: number;
      items: CreatorCampaign[];
    };

export const useCreatorHomeCampaigns = () => {
  const navigation = useNavigation<Navigation>();
  const { data } = useGetCreatorDealSummaryQuery();

  // `initial: false` keeps the feed under the campaign, so back lands there.
  const openCampaign = useCallback(
    (id: string) =>
      navigation.navigate('OpportunitiesTab', { screen: 'CampaignDetail', params: { id }, initial: false }),
    [navigation],
  );
  // The server ranks invitations first, so the feed is where a new invite shows.
  const openFeed = useCallback(() => navigation.navigate('OpportunitiesTab'), [navigation]);
  const openApplications = useCallback(
    () => navigation.navigate('OpportunitiesTab', { screen: 'Opportunities', params: { segment: 'applications' } }),
    [navigation],
  );

  const campaigns = useMemo((): CreatorHomeCampaigns => {
    const glance = data?.campaigns;
    if (!glance) return { kind: 'hidden' };
    return {
      kind: 'strip',
      feedCount: glance.feedCount,
      newInvites: glance.newInvites,
      openApplications: glance.openApplications,
      items: glance.items,
    };
  }, [data]);

  /** `null` until the summary answers: Home's map waits before swapping the campaigns tile. */
  const enabled = data ? data.campaignsEnabled : null;

  return { campaigns, enabled, openCampaign, openFeed, openApplications };
};

export type CreatorHomeCampaignsModel = ReturnType<typeof useCreatorHomeCampaigns>;
