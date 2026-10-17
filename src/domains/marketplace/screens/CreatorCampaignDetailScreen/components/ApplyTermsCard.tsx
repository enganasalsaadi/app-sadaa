import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, KeyValueRow, MoneyText } from '@/shared/ui';
import type { Money } from '@/core/money';
import type { CreatorCampaignDetail } from '../../../types/campaign';
import { deliverablesSummary } from '../../../utils/applicantSelect';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

export interface ApplyTermsCardProps {
  campaign: CreatorCampaignDetail;
  /** What the creator offers: the bid, or the fixed price. */
  offer: Money | null;
  /** The take-home: an estimate for a bid, the server's figure for a fixed price. */
  net: Money | null;
  estimated: boolean;
}

/**
 * The terms the signature freezes (contract §4.2): what is delivered, the price, the shipping and
 * the delivery. The private brief isn't one of them, so it isn't here.
 */
const ApplyTermsCardComponent: React.FC<ApplyTermsCardProps> = ({ campaign, offer, net, estimated }) => {
  const { t } = useTranslation();
  const { deliverables, shippingMode, dropAt, deliveryDays } = campaign;
  return (
    <Card p="lg">
      <Box gap="xs">
        <KeyValueRow
          label={t('marketplace.campaign.apply.terms.deliver')}
          value={deliverablesSummary(deliverables)}
        />
        {offer ? (
          <KeyValueRow
            label={t('marketplace.campaign.apply.terms.offer')}
            value={<MoneyText value={offer} size="sm" />}
          />
        ) : null}
        {net ? (
          <KeyValueRow
            label={t(estimated ? 'marketplace.campaign.apply.terms.netEstimate' : 'marketplace.campaign.apply.terms.net')}
            value={<MoneyText value={net} size="sm" tone="money" estimate={estimated} />}
          />
        ) : null}
        <KeyValueRow label={t('marketplace.campaign.apply.terms.shipping')} value={shippingMode.label} />
        {dropAt !== null ? (
          <KeyValueRow label={t('marketplace.campaign.apply.terms.dropAt')} value={formatCampaignDateTime(dropAt)} />
        ) : deliveryDays !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.apply.terms.delivery')}
            value={t('marketplace.campaign.opportunity.schedule.deliveryValue', { count: deliveryDays })}
          />
        ) : null}
      </Box>
    </Card>
  );
};

export const ApplyTermsCard = memo(ApplyTermsCardComponent);
