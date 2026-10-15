import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import {
  DEAL_NEXT_ACTOR_LABEL,
  DEAL_NEXT_STEP_COPY,
} from '../constants/dealCopy';
import type { DealDeliverableAction } from '../utils/dealDrafts';
import type { DealNextStep } from '../utils/dealNextStep';

/** The deliverable the next step is about (P6): hand in its round or review it. */
const ACTION_LABEL = {
  submit: 'marketplace.deals.drafts.next.submit',
  review: 'marketplace.deals.drafts.next.review',
  approveAsIs: 'marketplace.deals.drafts.next.approveAsIs',
  publish: 'marketplace.deals.publish.next.publish',
  verify: 'marketplace.deals.publish.next.verify',
  view: 'marketplace.deals.drafts.next.view',
} as const satisfies Record<DealDeliverableAction, ParseKeys>;

export interface DealNextStepCardProps {
  step: DealNextStep;
  /** The other side's name. */
  name: string;
  /** A deliverable waiting on the viewer: the card carries the button into it. */
  action?: DealDeliverableAction | null;
  itemId?: string | null;
  onAction?: (itemId: string) => void;
}

/**
 * «Next step · who»: the one thing that moves the deal now, in a sentence, and what happens
 * around it. A teal edge when it's the viewer's turn.
 */
const DealNextStepCardComponent: React.FC<DealNextStepCardProps> = ({
  step,
  name,
  action = null,
  itemId = null,
  onAction,
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

  const open = useCallback(() => {
    if (itemId) onAction?.(itemId);
  }, [itemId, onAction]);

  return (
    <Box style={styles.card}>
      <Box gap="xs" accessible>
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
      {action && itemId && onAction ? (
        <Box mt="sm">
          <CustomButton
            title={t(ACTION_LABEL[action])}
            size="md"
            onPress={open}
            fullWidth
          />
        </Box>
      ) : null}
    </Box>
  );
};

export const DealNextStepCard = memo(DealNextStepCardComponent);
