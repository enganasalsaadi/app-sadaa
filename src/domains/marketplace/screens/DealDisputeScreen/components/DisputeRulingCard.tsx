import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gavel } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { formatDate } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, StatusPill, Text } from '@/shared/ui';
import type { DealDisputeRuling, DealRole } from '../../../types';
import { rulingForViewer, rulingShares, type DealRulingShare } from '../../../utils/dealDispute';

const TIME_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' };
const BAR_H = moderateScale(12);
const DOT = moderateScale(10);

const SHARE_LABEL = {
  refund: 'marketplace.deals.dispute.ruling.refund',
  creator: 'marketplace.deals.dispute.ruling.creator',
  commission: 'marketplace.deals.dispute.ruling.commission',
} as const satisfies Record<DealRulingShare['key'], ParseKeys>;

export interface DisputeRulingCardProps {
  ruling: DealDisputeRuling;
  role: DealRole;
}

/**
 * The decision: what it means for the viewer first (big), then where the held money went as one
 * bar split by the server's figures, then the team's reasoning.
 */
const DisputeRulingCardComponent: React.FC<DisputeRulingCardProps> = ({ ruling, role }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const shares = useMemo(() => rulingShares(ruling), [ruling]);
  const tint = useMemo(
    (): Record<DealRulingShare['key'], string> => ({
      refund: colors.brand.main,
      creator: colors.money.main,
      commission: colors.border.strong,
    }),
    [colors.border.strong, colors.brand.main, colors.money.main],
  );
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'card' | 'bar' | 'dot' | 'reason', ViewStyle> => ({
      card: { padding: spacing.lg, gap: spacing.lg, borderRadius: radii.xl, backgroundColor: colors.surface.main },
      bar: {
        height: BAR_H,
        borderRadius: radii.full,
        overflow: 'hidden',
        flexDirection: 'row',
        gap: borderWidths.md,
        backgroundColor: colors.surface.elevated,
      },
      dot: { width: DOT, height: DOT, borderRadius: radii.full },
      reason: { padding: spacing.md, gap: spacing.xs, borderRadius: radii.lg, backgroundColor: colors.surface.elevated },
    }),
    [colors.surface.elevated, colors.surface.main],
  );

  return (
    <Box style={styles.card} shadow="card">
      <Box row align="center" justify="space-between" gap="md">
        <StatusPill label={ruling.outcome.label} tone="info" icon={Gavel} size="sm" />
        {ruling.resolvedAt ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {formatDate(ruling.resolvedAt, TIME_FORMAT, i18n.language)}
          </Text>
        ) : null}
      </Box>
      <Box gap="xs">
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t(role === 'brand' ? 'marketplace.deals.dispute.file.brandShare' : 'marketplace.deals.dispute.file.creatorShare')}
        </Text>
        <MoneyText value={rulingForViewer(ruling, role)} size="hero" tone="money" animated />
      </Box>
      {shares.length > 0 ? (
        <Box gap="md">
          <Box style={styles.bar} accessible={false}>
            {shares.map(share => (
              <Box key={share.key} flex={share.amount.amount} bg={tint[share.key]} />
            ))}
          </Box>
          <Box gap="sm">
            {shares.map(share => (
              <Box key={share.key} row align="center" gap="sm">
                <Box style={styles.dot} bg={tint[share.key]} />
                <Box flex={1}>
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {t(SHARE_LABEL[share.key])}
                  </Text>
                </Box>
                <MoneyText value={share.amount} size="sm" />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
      {ruling.reason ? (
        <Box style={styles.reason}>
          <Text variant="overline" color={colors.text.tertiary}>
            {t('marketplace.deals.dispute.ruling.reason')}
          </Text>
          <Text variant="bodySmall" color={colors.text.primary}>
            {ruling.reason}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export const DisputeRulingCard = memo(DisputeRulingCardComponent);
