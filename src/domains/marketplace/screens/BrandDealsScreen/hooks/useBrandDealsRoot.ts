import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SegmentedOption } from '@/shared/ui';
import { useBrandDeals } from '../../../hooks/useBrandDeals';
import { useCampaignsEnabled } from '../../../hooks/useCampaignsEnabled';
import { useCampaignsList } from '../../../hooks/useCampaignsList';
import type { HubFace } from '../../../types/hub';

/**
 * The brand's deals tab: public campaigns lead, direct requests are the second face. Both are
 * read from the start so each face can badge what waits on the brand in it; without Public
 * Campaigns (flag off or not known yet) it is the direct requests alone and the switch is gone.
 * One pull refreshes both faces, so the badges and counts of the face out of sight stay true.
 */
export const useBrandDealsRoot = () => {
  const { t } = useTranslation();
  const campaignsEnabled = useCampaignsEnabled('brand') === true;
  const [chosen, setFace] = useState<HubFace>('campaigns');
  const campaigns = useCampaignsList(campaignsEnabled);
  const deals = useBrandDeals();
  const refreshCampaigns = campaigns.onRefresh;
  const refreshDeals = deals.onRefresh;
  const campaignsAttention = campaigns.attentionCount;
  const dealsAttention = deals.attentionCount;

  const faces: SegmentedOption<HubFace>[] | null = useMemo(
    () =>
      campaignsEnabled
        ? [
            {
              value: 'campaigns',
              label: t('marketplace.hub.faces.campaigns'),
              badge: campaignsAttention,
            },
            {
              value: 'deals',
              label: t('marketplace.hub.faces.deals'),
              badge: dealsAttention,
            },
          ]
        : null,
    [campaignsAttention, campaignsEnabled, dealsAttention, t],
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshDeals(),
      ...(campaignsEnabled ? [refreshCampaigns()] : []),
    ]);
  }, [campaignsEnabled, refreshCampaigns, refreshDeals]);

  return {
    face: campaignsEnabled ? chosen : 'deals',
    setFace,
    faces,
    campaigns,
    deals,
    onRefresh,
  };
};
