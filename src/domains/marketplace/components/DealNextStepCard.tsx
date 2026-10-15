import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import {
  DEAL_NEXT_ACTOR_LABEL,
  DEAL_NEXT_STEP_COPY,
} from '../constants/dealCopy';
import type { DealNextStep } from '../utils/dealNextStep';

export interface DealNextStepCardProps {
  step: DealNextStep;
  /** The other side's name. */
  name: string;
}

/**
 * «Next step · who»: the one thing that moves the deal now, in a sentence, and what happens
 * around it. A teal edge when it's the viewer's turn.
 */
const DealNextStepCardComponent: React.FC<DealNextStepCardProps> = ({
  step,
  name,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const mine = step.actor === 'you';
  const copy = DEAL_NEXT_STEP_COPY[step.key];
  const styles = useStyles(
    ({ radii, spacing, borderWidths, shadows }): Record<'card', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.xs,
        backgroundColor: mine ? colors.interactive.soft : colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: mine ? colors.interactive.main : colors.border.card,
        ...(mine ? {} : shadows.card),
      },
    }),
    [
      colors.border.card,
      colors.interactive.main,
      colors.interactive.soft,
      colors.surface.main,
      mine,
    ],
  );

  return (
    <Box style={styles.card} accessible>
      <Text
        variant="overline"
        color={mine ? colors.interactive.text : colors.text.tertiary}
      >
        {t('marketplace.deals.nextCard', {
          actor: t(DEAL_NEXT_ACTOR_LABEL[step.actor], { name }),
        })}
      </Text>
      <Text variant="title" color={colors.text.primary}>
        {t(copy.title, { name })}
      </Text>
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t(copy.body, { name })}
      </Text>
    </Box>
  );
};

export const DealNextStepCard = memo(DealNextStepCardComponent);
