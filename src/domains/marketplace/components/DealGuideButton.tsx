import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

export interface DealGuideButtonProps {
  onPress: () => void;
}

/** Entry to the deal guide: every stage in detail, who acts, how long, what if someone is late. */
const DealGuideButtonComponent: React.FC<DealGuideButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'button' | 'mark', ViewStyle> => ({
      button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.xl,
        borderWidth: borderWidths.sm,
        borderStyle: 'dashed',
        borderColor: colors.interactive.main,
        backgroundColor: colors.interactive.soft,
      },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
      },
    }),
    [colors.interactive.main, colors.interactive.soft, colors.surface.main, sizes.icon.xl],
  );
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      style={styles.button}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.offer.guideButton.title')}
      accessibilityHint={t('marketplace.offer.guideButton.body')}
    >
      <Box style={styles.mark}>
        <BookOpenText size={sizes.icon.sm} color={colors.interactive.main} />
      </Box>
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.interactive.text}>
          {t('marketplace.offer.guideButton.title')}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.offer.guideButton.body')}
        </Text>
      </Box>
      <Chevron size={sizes.icon.sm} color={colors.interactive.text} />
    </Pressable>
  );
};

export const DealGuideButton = memo(DealGuideButtonComponent);
