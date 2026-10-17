import type { PushTarget } from '@/core/notification';

/**
 * Tags a campaign push stales (CM11): the campaign on both sides, the brand's list / history / home
 * rail and the creator's feed, saved list and applications. The push can't say which role reads it,
 * and only queries on screen refetch, so both sets are cheap. A deal push stales the creator's
 * applications too: once selected, an application shows the linked deal's stage (CM6 `state`), and
 * `campaign_selected` / `campaign_drop_*` arrive with the deal's link. The brand's launch room lists those
 * deals, and a deal push can't name its campaign, so it stales every drop dashboard (only the one on
 * screen refetches). The shipping manifest follows the same way: a funded deal or an address entered
 * adds or frees a parcel. Other kinds touch nothing here.
 */
export const campaignPushTags = (target: PushTarget | null) => {
  if (target?.kind === 'deal') return [{ type: 'CampaignApplicationList', id: 'LIST' }, 'CampaignDrop', 'CampaignShipping'] as const;
  if (target?.kind !== 'campaign') return [];
  const id = target.campaignId;
  return [
    { type: 'Campaign', id },
    { type: 'CampaignList', id: 'LIST' },
    { type: 'CampaignHistory', id },
    { type: 'CampaignDrop', id },
    { type: 'CampaignShipping', id },
    'BrandHome',
    { type: 'CreatorCampaign', id },
    { type: 'CreatorCampaignList', id: 'FEED' },
    { type: 'CreatorCampaignList', id: 'SAVED' },
    { type: 'CampaignApplicationList', id: 'LIST' },
  ] as const;
};
