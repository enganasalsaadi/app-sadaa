import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flag, Quote } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, StatusPill, Text } from '@/shared/ui';
import type { DealDispute } from '../../../types';

const TIME_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export interface DisputeStatementCardProps {
  dispute: DealDispute;
  /** The viewer opened it. */
  mine: boolean;
  /** The other party's name (already bidi-isolated). */
  other: string;
}

/** What the dispute is about: the opener's reason and statement, the first weight on the scales. */
const DisputeStatementCardComponent: React.FC<DisputeStatementCardProps> = ({ dispute, mine, other }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'card' | 'quote', ViewStyle> => ({
      card: {
        padding: spacing.lg,
        gap: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        borderTopWidth: borderWidths.lg,
        borderTopColor: colors.status.danger.main,
      },
      quote: { position: 'absolute', top: spacing.md, end: spacing.md },
    }),
    [colors.status.danger.main, colors.surface.main],
  );

  return (
    <Box style={styles.card} shadow="card">
      <Box style={styles.quote}>
        <Quote size={sizes.icon.lg} color={colors.status.danger.soft} />
      </Box>
      <Box row align="center" gap="sm" wrap>
        <StatusPill label={dispute.reason.label} tone="danger" icon={Flag} size="sm" />
      </Box>
      <Text variant="caption" color={colors.text.tertiary}>
        {mine
          ? t('marketplace.deals.dispute.file.openedByYou')
          : t('marketplace.deals.dispute.file.openedBy', { name: other })}
        {dispute.openedAt ? ` · ${formatDate(dispute.openedAt, TIME_FORMAT, i18n.language)}` : ''}
      </Text>
      <Text variant="body" color={colors.text.primary}>
        {dispute.statement}
      </Text>
    </Box>
  );
};

export const DisputeStatementCard = memo(DisputeStatementCardComponent);
