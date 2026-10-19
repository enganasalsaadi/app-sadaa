import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Notice } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignDateSheet } from './CampaignDateSheet';
import { CampaignField } from './CampaignField';
import { CampaignQuoteCard } from './CampaignQuoteCard';
import { PricingField } from './PricingField';
import { ScheduleField } from './ScheduleField';
import { SeatsField } from './SeatsField';

/**
 * Step 3, «money and seats»: what a seat pays, how many seats, the server's estimate of the most
 * that could be held against the wallet, then the dates (deadline, delivery window or drop). On a
 * published campaign seats and the deadline have their own actions, so a note points there.
 */
const MoneyStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { live } = useCampaignWizard();
  return (
    <Box py="xl" gap="2xl">
      <CampaignField label={t('marketplace.campaign.wizard.money.pricing.label')}>
        <PricingField />
      </CampaignField>
      {live ? <Notice tone="info" message={t('marketplace.campaign.wizard.live.managed')} /> : <SeatsField />}
      <CampaignQuoteCard />
      <ScheduleField />
      <CampaignDateSheet />
    </Box>
  );
};

export const MoneyStep = memo(MoneyStepComponent);
