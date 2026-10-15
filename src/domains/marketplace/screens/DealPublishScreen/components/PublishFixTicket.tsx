import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealPublication } from '../../../types';
import type { DealFixCount } from '../../../utils/dealPublish';

export interface PublishFixTicketProps {
  brand: string;
  /** The submission the brand sent back. */
  ask: DealPublication;
  fixes: DealFixCount;
}

/** What the brand said was wrong with the last link, which fix request this is, and which submission it was on. */
const PublishFixTicketComponent: React.FC<PublishFixTicketProps> = ({ brand, ask, fixes }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'ticket' | 'chip', ViewStyle> => ({
      ticket: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderStartWidth: borderWidths.xl,
        borderColor: colors.status.warning.main,
        ...shadows.card,
      },
      chip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.surface.elevated,
      },
    }),
    [colors.status.warning.main, colors.surface.elevated, colors.surface.main],
  );

  return (
    <Box style={styles.ticket} accessible accessibilityRole="summary">
      <Box row align="center" gap="sm">
        <AlertTriangle size={sizes.icon.sm} color={colors.status.warning.main} />
        <Text variant="bodyMedium" color={colors.status.warning.text}>
          {t('marketplace.deals.publish.creator.ask.title', { brand })}
        </Text>
      </Box>
      {ask.review?.note ? (
        <Text variant="body" color={colors.text.primary}>
          {ask.review.note}
        </Text>
      ) : null}
      <Box row wrap gap="sm">
        <Box style={styles.chip}>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.publish.creator.ask.count', {
              used: formatNumber(fixes.used),
              allowed: formatNumber(fixes.allowed),
            })}
          </Text>
        </Box>
        <Box style={styles.chip}>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.publish.creator.ask.previous', { sequence: formatNumber(ask.sequence) })}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export const PublishFixTicket = memo(PublishFixTicketComponent);
