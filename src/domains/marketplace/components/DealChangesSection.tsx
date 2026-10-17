import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, Pressable, SectionHeader, StatusPill, Text } from '@/shared/ui';
import type { DealCancelModel } from '../hooks/useDealCancel';
import type { DealDisputeModel } from '../hooks/useDealDispute';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { DealRole } from '../types';
import { dealUpsellTone, formatUpsellLine } from '../utils/dealUpsell';

export interface DealChangesSectionProps {
  role: DealRole;
  upsells: DealUpsellsModel;
  cancel: DealCancelModel;
  dispute: DealDisputeModel;
}

/**
 * The bottom of the deal page: addenda already answered, the brand's way to add a service or
 * add-on while the window is open, then the quiet ways out (open a dispute; cancel for the brand,
 * withdraw for the creator), kept low and plain so they are never tapped by accident.
 */
const DealChangesSectionComponent: React.FC<DealChangesSectionProps> = ({ role, upsells, cancel, dispute }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { history, canPropose } = upsells;
  const brand = role === 'brand';
  const leave = brand ? cancel.canCancel : cancel.canWithdraw;
  const contest = dispute.canOpen;
  if (history.length === 0 && !canPropose && !leave && !contest) return null;

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
      {contest ? (
        <Pressable
          onPress={dispute.open}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.dispute.link')}
        >
          <Box align="center" gap="xs" py="md">
            <Text variant="buttonSmall" color={colors.status.danger.text}>
              {t('marketplace.deals.dispute.link')}
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.dispute.linkCaption', {
                count: dispute.disputesLeft,
                remaining: formatNumber(dispute.disputesLeft),
              })}
            </Text>
          </Box>
        </Pressable>
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
                  cancel.penaltyFree
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
