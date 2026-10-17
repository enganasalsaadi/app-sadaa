import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Rocket, Truck } from 'lucide-react-native';
import { ListGroup, ListRow } from '@/shared/ui';
import type { Campaign } from '../types/campaign';
import type { CampaignBatchTools } from '../utils/campaignBatchTools';
import { secondsBetween } from '../utils/campaignDrop';
import { formatRemaining } from '../utils/dealTimer';
import { useClock } from '../hooks/useClock';

const MINUTE = 60_000;

export interface CampaignBatchToolsCardProps {
  campaign: Pick<Campaign, 'dropAt'>;
  tools: CampaignBatchTools;
  onOpenDrop: () => void;
  onOpenShipping: () => void;
  onOpenAnnouncements: () => void;
}

/** The brand's batch tools of a campaign: one quiet row per tool that applies (launch room, shipping, broadcasts). */
const CampaignBatchToolsCardComponent: React.FC<CampaignBatchToolsCardProps> = ({
  campaign,
  tools,
  onOpenDrop,
  onOpenShipping,
  onOpenAnnouncements,
}) => {
  const { t } = useTranslation();
  const now = useClock(MINUTE);
  const dropAt = campaign.dropAt;

  return (
    <ListGroup title={t('marketplace.campaign.detail.tools.title')}>
      {tools.drop ? (
        <ListRow
          icon={Rocket}
          title={t('marketplace.campaign.detail.tools.drop.title')}
          subtitle={
            dropAt !== null && dropAt > now
              ? t('marketplace.campaign.detail.tools.drop.pending', { remaining: formatRemaining(t, secondsBetween(now, dropAt)) })
              : t('marketplace.campaign.detail.tools.drop.live')
          }
          onPress={onOpenDrop}
        />
      ) : null}
      {tools.shipping ? (
        <ListRow
          icon={Truck}
          title={t('marketplace.campaign.detail.tools.shipping.title')}
          subtitle={t('marketplace.campaign.detail.tools.shipping.subtitle')}
          onPress={onOpenShipping}
        />
      ) : null}
      {tools.announcements ? (
        <ListRow
          icon={Megaphone}
          title={t('marketplace.campaign.detail.tools.announcements.title')}
          subtitle={t('marketplace.campaign.detail.tools.announcements.subtitle')}
          onPress={onOpenAnnouncements}
        />
      ) : null}
    </ListGroup>
  );
};

export const CampaignBatchToolsCard = memo(CampaignBatchToolsCardComponent);
