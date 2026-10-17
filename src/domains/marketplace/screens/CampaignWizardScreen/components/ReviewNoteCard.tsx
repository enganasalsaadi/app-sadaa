import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageSquareWarning } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface ReviewNoteCardProps {
  /** The team's words, shown as they wrote them. */
  note: string;
}

/** The Sada team's note when they asked for changes: what to fix before sending again. */
const ReviewNoteCardComponent: React.FC<ReviewNoteCardProps> = ({ note }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'card', ViewStyle> => ({
      card: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radii.md,
        backgroundColor: colors.surface.main,
        borderStartWidth: borderWidths.xl,
        borderStartColor: colors.status.warning.main,
        ...shadows.card,
      },
    }),
    [colors.status.warning.main, colors.surface.main],
  );

  return (
    <Box style={styles.card} accessibilityRole="summary">
      <Box row align="center" gap="sm">
        <MessageSquareWarning size={sizes.icon.xs} color={colors.status.warning.main} />
        <Text variant="label" color={colors.status.warning.text}>
          {t('marketplace.campaign.wizard.review.note.title')}
        </Text>
      </Box>
      <Text variant="body" color={colors.text.primary}>
        {note}
      </Text>
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.campaign.wizard.review.note.body')}
      </Text>
    </Box>
  );
};

export const ReviewNoteCard = memo(ReviewNoteCardComponent);
