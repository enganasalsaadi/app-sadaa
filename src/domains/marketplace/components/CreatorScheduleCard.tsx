import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, KeyValueRow } from '@/shared/ui';
import type { CreatorCampaign } from '../types/campaign';
import { formatCampaignDateTime } from '../utils/campaignSchedule';

export interface CreatorScheduleCardProps {
  campaign: Pick<
    CreatorCampaign,
    'applyDeadlineAt' | 'dropAt' | 'deliveryDays' | 'shippingMode'
  >;
}

/** When to apply, when the brand answers (72 h is the contract's fixed window), when the work is due and how a product reaches the creator. */
const CreatorScheduleCardComponent: React.FC<CreatorScheduleCardProps> = ({
  campaign,
}) => {
  const { t } = useTranslation();
  const { applyDeadlineAt, dropAt, deliveryDays, shippingMode } = campaign;
  return (
    <Card p="lg">
      <Box gap="xs">
        {applyDeadlineAt !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.opportunity.schedule.deadline')}
            value={formatCampaignDateTime(applyDeadlineAt)}
          />
        ) : null}
        <KeyValueRow
          label={t('marketplace.campaign.opportunity.schedule.reply')}
          value={t('marketplace.campaign.opportunity.schedule.replyValue')}
        />
        {dropAt !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.opportunity.schedule.drop')}
            value={formatCampaignDateTime(dropAt)}
          />
        ) : deliveryDays !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.opportunity.schedule.delivery')}
            value={t(
              'marketplace.campaign.opportunity.schedule.deliveryValue',
              { count: deliveryDays },
            )}
          />
        ) : null}
        <KeyValueRow
          label={t('marketplace.campaign.opportunity.schedule.shipping')}
          value={shippingMode.label}
        />
      </Box>
    </Card>
  );
};

export const CreatorScheduleCard = memo(CreatorScheduleCardComponent);
