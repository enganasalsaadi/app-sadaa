import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface ReviewCaptionProps {
  caption: string | null;
}

/** The caption handed in with the round, set off like a quote. */
const ReviewCaptionComponent: React.FC<ReviewCaptionProps> = ({ caption }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ spacing, borderWidths }): Record<'quote', ViewStyle> => ({
      quote: {
        borderStartWidth: borderWidths.md,
        borderColor: colors.border.strong,
        paddingStart: spacing.md,
        gap: spacing.xs,
      },
    }),
    [colors.border.strong],
  );
  return (
    <Box style={styles.quote}>
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.drafts.review.caption')}
      </Text>
      <Text variant="bodySmall" color={caption ? colors.text.secondary : colors.text.tertiary}>
        {caption ?? t('marketplace.deals.drafts.review.noCaption')}
      </Text>
    </Box>
  );
};

export const ReviewCaption = memo(ReviewCaptionComponent);
