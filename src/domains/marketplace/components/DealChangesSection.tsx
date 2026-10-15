import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, Pressable, SectionHeader, StatusPill, Text } from '@/shared/ui';
import type { DealCancelModel } from '../hooks/useDealCancel';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { DealRole } from '../types';
import { dealUpsellTone, formatUpsellLine } from '../utils/dealUpsell';

export interface DealChangesSectionProps {
  role: DealRole;
  upsells: DealUpsellsModel;
  cancel: DealCancelModel;
}

/**
 * The bottom of the deal page: addenda already answered, the brand's way to add a service or
 * add-on while the window is open, and the quiet way out (cancel for the brand, withdraw for the
 * creator), kept low and plain so it is never tapped by accident.
 */
const DealChangesSectionComponent: React.FC<DealChangesSectionProps> = ({ role, upsells, cancel }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { history, canPropose } = upsells;
  const brand = role === 'brand';
  const leave = brand ? cancel.canCancel : cancel.canWithdraw;
  if (history.length === 0 && !canPropose && !leave) return null;

  return (
    <Box gap="lg">
      {history.length > 0 ? (
        <Box gap="md">
          <SectionHeader title={t('marketplace.deals.changes.upsells.title')} />
          <Box p="lg" gap="lg" bg={colors.surface.main} borderRadius="xl" shadow="card">
            {history.map(upsell => (
              <Box key={upsell.id} row align="center" gap="md">
                <Box flex={1} gap="xs">
                  <Text variant="bodyMedium" color={colors.text.primary}>
                    {formatUpsellLine(t, upsell)}
                  </Text>
                  <StatusPill label={upsell.status.label} tone={dealUpsellTone(upsell)} size="sm" />
                </Box>
                <MoneyText value={upsell.amount} size="sm" tone="muted" showSign />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
      {canPropose ? (
        <CustomButton
          title={t('marketplace.deals.changes.upsells.add')}
          variant="outline"
          fullWidth
          leftIcon={<Plus size={sizes.icon.sm} color={colors.interactive.main} />}
          onPress={upsells.openBuilder}
        />
      ) : null}
      {leave ? (
        <Pressable
          onPress={cancel.open}
          accessibilityRole="button"
          accessibilityLabel={t(
            brand ? 'marketplace.deals.changes.cancel.link' : 'marketplace.deals.changes.withdraw.link',
          )}
        >
          <Box align="center" gap="xs" py="md">
            <Text variant="buttonSmall" color={colors.status.danger.text}>
              {t(brand ? 'marketplace.deals.changes.cancel.link' : 'marketplace.deals.changes.withdraw.link')}
            </Text>
            {brand ? null : (
              <Text variant="caption" color={colors.text.tertiary}>
                {t(
                  cancel.freeCancel
                    ? 'marketplace.deals.changes.withdraw.linkCaptionFree'
                    : 'marketplace.deals.changes.withdraw.linkCaption',
                )}
              </Text>
            )}
          </Box>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DealChangesSection = memo(DealChangesSectionComponent);
