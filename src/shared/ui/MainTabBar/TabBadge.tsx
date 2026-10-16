import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '../primitives';

const MAX = 9;
const SIZE = moderateScale(18);
const OFFSET = moderateScale(-7);

/**
 * Amber count on a tab icon, ringed in the bar's surface so it reads as cut out of the icon.
 * Zero renders nothing; above 9 it reads `9+`. Decorative: the tab's label speaks the count.
 */
const TabBadgeComponent: React.FC<{ count: number }> = ({ count }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ colors: palette, borderWidths, spacing }): Record<'badge', ViewStyle> => ({
      badge: {
        position: 'absolute',
        top: OFFSET,
        end: OFFSET,
        minWidth: SIZE,
        height: SIZE,
        paddingHorizontal: spacing.xs,
        borderRadius: SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.navigation.tabBar.badge,
        borderWidth: borderWidths.md,
        borderColor: palette.navigation.tabBar.background,
      },
    }),
    [],
  );
  if (count <= 0) return null;
  return (
    <Box style={styles.badge} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <Text variant="caption" color={colors.navigation.tabBar.onBadge}>
        {count > MAX ? `${formatNumber(MAX)}+` : formatNumber(count)}
      </Text>
    </Box>
  );
};

export const TabBadge = memo(TabBadgeComponent);
