import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface FABProps {
  icon: LucideIcon;
  onPress: () => void;
  /** Extended FAB when set; the icon-only FAB uses it as its accessibility label too. */
  label?: string;
  accessibilityLabel: string;
  disabled?: boolean;
}

/**
 * Floating action pinned to the bottom-end corner of its parent (`position: relative`
 * container, or the screen root). One per screen — it is the screen's primary action.
 */
const FABComponent: React.FC<FABProps> = ({
  icon: Icon,
  onPress,
  label,
  accessibilityLabel,
  disabled = false,
}) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing, zIndices }) => ({
    anchor: {
      position: 'absolute' as const,
      bottom: spacing.xl,
      end: spacing.xl,
      zIndex: zIndices.sticky,
    },
  }));
  const palette = colors.button.primary;

  return (
    <Box style={styles.anchor}>
      <Pressable
      onPress={onPress}
      disabled={disabled}
      row
      align="center"
      justify="center"
      gap="sm"
      minWidth={sizes.button.lg}
      height={sizes.button.lg}
      px={label ? 'xl' : undefined}
      borderRadius="lg"
      bg={palette.bg}
      shadow="md"
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Icon size={sizes.icon.md} color={palette.text} strokeWidth={iconStroke.regular} />
      {label ? (
        <Text variant="button" color={palette.text}>
          {label}
        </Text>
      ) : null}
      </Pressable>
    </Box>
  );
};

export const FAB = memo(FABComponent);
