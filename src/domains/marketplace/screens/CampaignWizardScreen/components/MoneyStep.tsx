import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@/shared/ui';
import { CampaignDateSheet } from './CampaignDateSheet';
import { CampaignField } from './CampaignField';
import { CampaignQuoteCard } from './CampaignQuoteCard';
import { PricingField } from './PricingField';
import { ScheduleField } from './ScheduleField';
import { SeatsField } from './SeatsField';

/**
 * Step 3, «money and seats»: what a seat pays, how many seats, the server's estimate of the most
 * that could be held against the wallet, then the dates (deadline, delivery window or drop).
 */
const MoneyStepComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box px="xl" py="xl" gap="2xl">
      <CampaignField label={t('marketplace.campaign.wizard.money.pricing.label')}>
        <PricingField />
      </CampaignField>
      <SeatsField />
      <CampaignQuoteCard />
      <ScheduleField />
      <CampaignDateSheet />
    </Box>
  );
};

export const MoneyStep = memo(MoneyStepComponent);
