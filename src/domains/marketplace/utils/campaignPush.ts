import type { PushTarget } from '@/core/notification';

/**
 * Tags a campaign push stales (CM11): the campaign on both sides, the brand's list / history / home
 * rail and the creator's feed, saved list and applications. The push can't say which role reads it,
 * and only queries on screen refetch, so both sets are cheap. Other push kinds touch nothing here.
 */
export const campaignPushTags = (target: PushTarget | null) => {
  if (target?.kind !== 'campaign') return [];
  const id = target.campaignId;
  return [
    { type: 'Campaign', id },
    { type: 'CampaignList', id: 'LIST' },
    { type: 'CampaignHistory', id },
    'BrandHome',
    { type: 'CreatorCampaign', id },
    { type: 'CreatorCampaignList', id: 'FEED' },
    { type: 'CreatorCampaignList', id: 'SAVED' },
    { type: 'CampaignApplicationList', id: 'LIST' },
  ] as const;
};
