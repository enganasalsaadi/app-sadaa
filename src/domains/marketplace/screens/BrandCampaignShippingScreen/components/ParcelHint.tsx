import React, { memo, useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { dealCourierLabels } from '../../../constants/dealShipping';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignShippingFormValues } from '../../../utils/campaignShipping';

export interface ParcelHintProps {
  dealId: string;
  control: Control<CampaignShippingFormValues>;
}

/** Under a parcel that is not ticked: what to do, or the courier a «courier for all» already set on it. */
const ParcelHintComponent: React.FC<ParcelHintProps> = ({ dealId, control }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const courier = useWatch({ control, name: `rows.${dealId}.courier` });
  const labels = useMemo(() => dealCourierLabels(t), [t]);
  return (
    <Box px="md" pb="md">
      <Text variant="caption" color={colors.text.tertiary}>
        {courier
          ? t('marketplace.campaign.shipping.parcel.courierPicked', { courier: labels[courier] })
          : t('marketplace.campaign.shipping.parcel.fill')}
      </Text>
    </Box>
  );
};

export const ParcelHint = memo(ParcelHintComponent);
