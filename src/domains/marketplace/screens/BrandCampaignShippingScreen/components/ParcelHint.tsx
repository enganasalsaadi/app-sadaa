import React, { memo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { ChipGroupItem } from '@/shared/ui';
import type { CampaignShippingFormValues } from '../../../utils/campaignShipping';

export interface ParcelHintProps {
  dealId: string;
  control: Control<CampaignShippingFormValues>;
  courierItems: readonly ChipGroupItem[];
}

/** Under a parcel that is not ticked: what to do, or the courier a «courier for all» already set on it. */
const ParcelHintComponent: React.FC<ParcelHintProps> = ({ dealId, control, courierItems }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const courier = useWatch({ control, name: `rows.${dealId}.courier` });
  return (
    <Box px="md" pb="md">
      <Text variant="caption" color={colors.text.tertiary}>
        {courier
          ? t('marketplace.campaign.shipping.parcel.courierPicked', { courier: courierItems.find(item => item.value === courier)?.label ?? courier })
          : t('marketplace.campaign.shipping.parcel.fill')}
      </Text>
    </Box>
  );
};

export const ParcelHint = memo(ParcelHintComponent);
