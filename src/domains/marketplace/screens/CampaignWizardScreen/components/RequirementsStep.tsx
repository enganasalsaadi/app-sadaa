import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { CampaignField } from './CampaignField';
import { CatalogServiceSheet } from './CatalogServiceSheet';
import { DeliverablesField } from './DeliverablesField';
import { PrivateBriefRow } from './PrivateBriefRow';
import { PrivateBriefSheet } from './PrivateBriefSheet';
import { ShippingField } from './ShippingField';
import { TargetingGates } from './TargetingGates';
import { TargetingRanking } from './TargetingRanking';

/**
 * Step 2, «the requirements»: what each creator delivers, who may apply (gates) and who is
 * preferred (ranking only), whether a product is sent, and the optional private brief.
 */
const RequirementsStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box px="xl" py="xl" gap="2xl">
      <CampaignField label={t('marketplace.campaign.wizard.requirements.deliverables.label')}>
        <DeliverablesField />
      </CampaignField>
      <Box gap="md">
        <CampaignField
          label={t('marketplace.campaign.wizard.requirements.gates.label')}
          tag={t('marketplace.campaign.wizard.requirements.gates.tag')}
          tagTone="premium"
        >
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.requirements.gates.hint')}
          </Text>
        </CampaignField>
        <TargetingGates />
      </Box>
      <Box gap="md">
        <CampaignField
          label={t('marketplace.campaign.wizard.requirements.ranking.label')}
          tag={t('marketplace.campaign.wizard.requirements.ranking.tag')}
          tagTone="neutral"
        >
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.requirements.ranking.hint')}
          </Text>
        </CampaignField>
        <TargetingRanking />
      </Box>
      <ShippingField />
      <PrivateBriefRow />
      <CatalogServiceSheet />
      <PrivateBriefSheet />
    </Box>
  );
};

export const RequirementsStep = memo(RequirementsStepComponent);
