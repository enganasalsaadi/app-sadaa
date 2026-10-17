import React, { memo, useCallback } from 'react';
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { ReviewRowKey } from '../hooks/useCampaignReviewSummary';

/** How soft the brief's lines go: readable as «there is something here», not as the words. */
const BLUR = moderateScale(9);

interface LockedBriefPreviewProps {
  lines: readonly string[];
  onOpen: (key: ReviewRowKey) => void;
}

/**
 * The private brief as the creator meets it before funding: its own lines, blurred, under a lock
 * that says when they open. Tapping opens the brief to edit.
 */
const LockedBriefPreviewComponent: React.FC<LockedBriefPreviewProps> = ({ lines, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const label = t('marketplace.campaign.wizard.review.brief.locked');

  const styles = useStyles(
    ({ spacing, radii, shadows }): Record<'veil' | 'pill', ViewStyle> & Record<'blurred', TextStyle> => ({
      // The words stay out of reach: only their shadow is drawn.
      blurred: {
        color: colors.layout.transparent,
        textShadowColor: colors.text.secondary,
        textShadowRadius: BLUR,
        textShadowOffset: { width: 0, height: 0 },
      },
      veil: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radii.full,
        backgroundColor: colors.surface.main,
        ...shadows.sm,
      },
    }),
    [colors.layout.transparent, colors.surface.main, colors.text.secondary],
  );

  const onPress = useCallback(() => onOpen('brief'), [onOpen]);

  return (
    <Pressable
      borderRadius="lg"
      overflow="hidden"
      bg={colors.premium.soft}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Box p="lg" gap="sm" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {lines.map(line => (
          <Text key={line} variant="bodySmall" numberOfLines={1} style={styles.blurred}>
            {line}
          </Text>
        ))}
      </Box>
      <Box style={styles.veil}>
        <Box style={styles.pill}>
          <Lock size={sizes.icon.xs} color={colors.premium.main} />
          <Text variant="caption" color={colors.premium.text} numberOfLines={2}>
            {label}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
};

export const LockedBriefPreview = memo(LockedBriefPreviewComponent);
