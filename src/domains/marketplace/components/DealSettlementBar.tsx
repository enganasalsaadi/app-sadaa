import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { Money } from '@/core/money';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import type { DealSettlementPart } from '../utils/dealCancel';

const BAR_HEIGHT = moderateScale(14);
const DOT = moderateScale(10);

type PartKey = DealSettlementPart['key'];

export interface DealSettlementBarProps {
  /** What escrow holds now (the deal total). */
  held: Money;
  /** The server's outcome label («تعويض 40%»), beside the held amount. */
  outcomeLabel: string;
  parts: readonly DealSettlementPart[];
  creatorName: string;
}

/**
 * «التسوية» (approved 2026-10-15): one bar showing where every held dollar goes if the brand
 * cancels now — back to the wallet in mint (money coming home), the creator's compensation in
 * warning orange, the platform's fee in grey — then one line per share with the server's amount.
 * The shares resize smoothly when fresh terms arrive.
 */
const DealSettlementBarComponent: React.FC<DealSettlementBarProps> = ({ held, outcomeLabel, parts, creatorName }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const styles = useStyles(
    ({ radii, spacing }): Record<'bar' | 'dot' | PartKey, ViewStyle> => ({
      bar: {
        flexDirection: 'row',
        height: BAR_HEIGHT,
        gap: spacing.xs,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.surface.elevated,
      },
      dot: { width: DOT, height: DOT, borderRadius: radii.full, marginTop: spacing.xs },
      refund: { backgroundColor: colors.money.main },
      creator: { backgroundColor: colors.status.warning.main },
      fee: { backgroundColor: colors.border.strong },
    }),
    [colors.border.strong, colors.money.main, colors.status.warning.main, colors.surface.elevated],
  );
  // Shares sized by their amounts: a picture of the split, never used for money math.
  const widths = useStyles(
    (): Record<PartKey, ViewStyle> => {
      const flexOf = (key: PartKey) => ({ flex: parts.find(part => part.key === key)?.amount.amount ?? 0 });
      return { refund: flexOf('refund'), creator: flexOf('creator'), fee: flexOf('fee') };
    },
    [parts],
  );
  const copy = {
    refund: { label: t('marketplace.deals.changes.cancel.parts.refund'), caption: null },
    creator: {
      label: t('marketplace.deals.changes.cancel.parts.creator', { name: creatorName }),
      caption: t('marketplace.deals.changes.cancel.parts.creatorCaption'),
    },
    fee: {
      label: t('marketplace.deals.changes.cancel.parts.fee'),
      caption: t('marketplace.deals.changes.cancel.parts.feeCaption'),
    },
  } as const satisfies Record<PartKey, { label: string; caption: string | null }>;

  return (
    <Box p="lg" gap="lg" bg={colors.surface.main} borderRadius="xl" shadow="card">
      <Box row align="flex-end" justify="space-between" gap="md">
        <Box gap="xs" flex={1}>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.changes.cancel.held')}
          </Text>
          <MoneyText value={held} size="title" />
        </Box>
        <Box px="sm" py="xs" borderRadius="full" bg={colors.status.warning.soft}>
          <Text variant="caption" color={colors.status.warning.text}>
            {outcomeLabel}
          </Text>
        </Box>
      </Box>
      <Box style={styles.bar} accessible={false}>
        {parts.map(part => (
          <Animated.View
            key={part.key}
            layout={reduceMotion ? undefined : LinearTransition}
            style={[styles[part.key], widths[part.key]]}
          />
        ))}
      </Box>
      <Box gap="md">
        {parts.map(part => (
          <Box key={part.key} row gap="sm" align="flex-start">
            <Box style={[styles.dot, styles[part.key]]} />
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" color={colors.text.primary}>
                {copy[part.key].label}
              </Text>
              {copy[part.key].caption ? (
                <Text variant="caption" color={colors.text.tertiary}>
                  {copy[part.key].caption}
                </Text>
              ) : null}
            </Box>
            <MoneyText value={part.amount} size="md" tone={part.key === 'refund' ? 'money' : 'default'} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const DealSettlementBar = memo(DealSettlementBarComponent);
