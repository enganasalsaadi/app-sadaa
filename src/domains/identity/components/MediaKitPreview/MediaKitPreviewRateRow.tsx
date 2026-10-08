import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Zap } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Accordion, Box, MoneyText, Text } from '@/shared/ui';
import type { RateRow } from '../../utils/rateRows';

/** One priced slot: service · package and price; opens to what's included and its add-ons. */
const MediaKitPreviewRateRowComponent: React.FC<{ row: RateRow }> = ({ row }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const title = row.packageLabel ? `${row.serviceLabel} · ${row.packageLabel}` : row.serviceLabel;

  return (
    <Accordion
      title={title}
      subtitle={row.platformLabel ?? t('account.rates.inPerson')}
      trailing={<MoneyText value={row.price} />}
    >
      <Box gap="sm">
        {row.includes.map(line => (
          <Box key={line} row align="center" gap="sm">
            <Check size={sizes.icon.sm} color={colors.status.success.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {line}
              </Text>
            </Box>
          </Box>
        ))}
        {row.addons.map(addon => (
          <Box key={addon.key} row align="center" gap="sm">
            <Zap size={sizes.icon.sm} color={colors.interactive.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {addon.deliveryHours === null
                  ? addon.label
                  : t('account.mediaKit.previewScreen.addonWithHours', {
                      label: addon.label,
                      hours: t('account.rates.hours', { count: addon.deliveryHours }),
                    })}
              </Text>
            </Box>
            <MoneyText value={addon.price} showSign />
          </Box>
        ))}
      </Box>
    </Accordion>
  );
};

export const MediaKitPreviewRateRow = memo(MediaKitPreviewRateRowComponent);
