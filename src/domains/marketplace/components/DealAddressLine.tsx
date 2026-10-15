import React, { memo } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealAddressFormModel } from '../hooks/useDealAddressForm';

export interface DealAddressLineProps {
  form: DealAddressFormModel;
  /** Back to the address sheet. */
  onChange: () => void;
}

/** «Ships to area، city، governorate · change», on the signature sheets after the address step. */
const DealAddressLineComponent: React.FC<DealAddressLineProps> = ({ form, onChange }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [area, city, governorateId] = useWatch({
    control: form.control,
    name: ['area', 'city', 'governorateId'],
  });
  const place = [area.trim(), city.trim(), form.governorateLabel(governorateId)]
    .filter(Boolean)
    .join('، ');
  return (
    <Pressable
      row
      align="center"
      gap="sm"
      py="md"
      onPress={onChange}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.shipping.address.shipsTo', { place })}
      accessibilityHint={t('marketplace.deals.shipping.address.change')}
    >
      <MapPin size={sizes.icon.sm} color={colors.interactive.main} />
      <Box flex={1}>
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
          {t('marketplace.deals.shipping.address.shipsTo', { place })}
        </Text>
      </Box>
      <Text variant="buttonSmall" color={colors.interactive.text}>
        {t('marketplace.deals.shipping.address.change')}
      </Text>
    </Pressable>
  );
};

export const DealAddressLine = memo(DealAddressLineComponent);
