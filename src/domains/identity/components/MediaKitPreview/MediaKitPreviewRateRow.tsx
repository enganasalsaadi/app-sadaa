import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Zap } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Accordion, Box, MoneyText, Text } from '@/shared/ui';
import type { LockableRateRow } from '../../utils/rateRows';

/** 🔒 in place of an amount the viewer may not see (brand-explore §6). */
const LockedPrice = memo<{ masked: boolean }>(({ masked }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      accessible
      accessibilityLabel={t('account.mediaKit.publicScreen.lockedPriceA11y')}
    >
      <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
      {masked ? (
        <Text variant="bodyMedium" color={colors.text.tertiary}>
          {t('account.mediaKit.publicScreen.lockedPrice')}
        </Text>
      ) : null}
    </Box>
  );
});

/** One slot: service · package and price (🔒 when locked); opens to what's included and its add-ons. */
const MediaKitPreviewRateRowComponent: React.FC<{ row: LockableRateRow }> = ({ row }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const title = row.packageLabel ? `${row.serviceLabel} · ${row.packageLabel}` : row.serviceLabel;

  return (
    <Accordion
      title={title}
      subtitle={row.platformLabel ?? t('account.rates.inPerson')}
      trailing={row.price ? <MoneyText value={row.price} /> : <LockedPrice masked />}
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
            {addon.price ? <MoneyText value={addon.price} showSign /> : <LockedPrice masked={false} />}
          </Box>
        ))}
      </Box>
    </Accordion>
  );
};

export const MediaKitPreviewRateRow = memo(MediaKitPreviewRateRowComponent);
