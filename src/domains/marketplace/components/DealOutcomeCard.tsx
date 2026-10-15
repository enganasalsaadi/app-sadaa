import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleSlash } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DEAL_OUTCOME_COPY, isStoppedStatus } from '../constants/dealCopy';
import type { Deal } from '../types';

export interface DealOutcomeCardProps {
  deal: Pick<Deal, 'status' | 'declineReason'>;
}

/** A deal that ended early: the server's status, the reason when there is one, what it meant for the money. */
const DealOutcomeCardComponent: React.FC<DealOutcomeCardProps> = ({ deal }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.sm,
        backgroundColor: colors.status.neutral.soft,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
      },
    }),
    [colors.border.default, colors.status.neutral.soft],
  );
  const status = deal.status.key;

  return (
    <Box style={styles.card} accessible>
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.outcome.title')}
      </Text>
      <Box row align="center" gap="sm">
        <CircleSlash size={sizes.icon.sm} color={colors.status.neutral.main} />
        <Text variant="title" color={colors.text.primary}>
          {deal.status.label}
        </Text>
      </Box>
      {deal.declineReason ? (
        <Text variant="bodyMedium" color={colors.text.secondary}>
          {deal.declineReason.label}
        </Text>
      ) : null}
      {isStoppedStatus(status) ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t(DEAL_OUTCOME_COPY[status])}
        </Text>
      ) : null}
    </Box>
  );
};

export const DealOutcomeCard = memo(DealOutcomeCardComponent);
