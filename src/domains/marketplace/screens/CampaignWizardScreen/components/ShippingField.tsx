import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Ban, Gift, Undo2, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, InlineError, Text } from '@/shared/ui';
import type { DealShippingMode } from '../../../types/deal';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignField } from './CampaignField';
import { ShippingCard } from './ShippingCard';

const MODES = {
  none: {
    icon: Ban,
    title: 'marketplace.campaign.wizard.requirements.shipping.none.title',
    hint: 'marketplace.campaign.wizard.requirements.shipping.none.hint',
  },
  gift: {
    icon: Gift,
    title: 'marketplace.campaign.wizard.requirements.shipping.gift.title',
    hint: 'marketplace.campaign.wizard.requirements.shipping.gift.hint',
  },
  returnable: {
    icon: Undo2,
    title: 'marketplace.campaign.wizard.requirements.shipping.returnable.title',
    hint: 'marketplace.campaign.wizard.requirements.shipping.returnable.hint',
  },
} as const satisfies Record<DealShippingMode, { icon: LucideIcon; title: ParseKeys; hint: ParseKeys }>;

const MODE_ORDER: readonly DealShippingMode[] = ['none', 'gift', 'returnable'];

/**
 * One question: does the campaign send a product? None (content only), a gift, or a sample that
 * comes back. A product widens the gap before the drop and has the creator's address asked after
 * the selection.
 */
const ShippingFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { requirements } = useCampaignWizard();
  const { shippingMode, chooseShipping, gapDigitalDays, gapShippedDays, shippingError } = requirements;

  return (
    <CampaignField
      label={t('marketplace.campaign.wizard.requirements.shipping.label')}
      tag={t('marketplace.campaign.wizard.requirements.shipping.tag')}
      tagTone="neutral"
    >
      <Box row gap="sm" accessibilityRole="radiogroup">
        {MODE_ORDER.map(value => (
          <ShippingCard
            key={value}
            value={value}
            icon={MODES[value].icon}
            title={t(MODES[value].title)}
            hint={t(MODES[value].hint)}
            selected={shippingMode === value}
            onChoose={chooseShipping}
          />
        ))}
      </Box>
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t('marketplace.campaign.wizard.requirements.shipping.gap', { shipped: gapShippedDays, digital: gapDigitalDays })}
      </Text>
      {shippingError ? <InlineError error={shippingError} /> : null}
    </CampaignField>
  );
};

export const ShippingField = memo(ShippingFieldComponent);
