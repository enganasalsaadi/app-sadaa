import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import type { Theme } from '@/core/theme';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '../primitives';
import type { TabConfig } from '../BottomBar';

interface CurvedTabItemProps {
  isActive: boolean;
  label: string;
  icon: TabConfig['icon'];
  onPress: () => void;
}

/**
 * One tab in the curved bar: stacked icon + label. The active tab tints to the
 * interactive color, lifts slightly, and reveals a soft pill behind the icon. The
 * lift/opacity is driven by reanimated timing so focus changes cross-fade
 * instead of snapping.
 */
export const CurvedTabItem: React.FC<CurvedTabItemProps> = ({
  isActive,
  label,
  icon: Icon,
  onPress,
}) => {
  const { colors, spacing } = useTheme();
  const styles = useStyles(createStyles);
  const active = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    active.value = withTiming(isActive ? 1 : 0, { duration: 220 });
  }, [isActive, active]);

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(active.value, [0, 1], [0, -2]) }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: active.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      flex={1}
      align="center"
      justify="center"
      py="xs"
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <Animated.View style={iconWrapStyle}>
        <Box align="center" justify="center" style={styles.iconBox}>
          <Animated.View
            style={[styles.pill, pillStyle]}
          />
          <Icon
            size={spacing.lg}
            color={isActive ? colors.text.onAccent : colors.text.secondary}
            strokeWidth={isActive ? 2.4 : 1.8}
          />
        </Box>
      </Animated.View>
      <Text
        variant="overline"
        mt="xs"
        numberOfLines={1}
        color={isActive ? colors.interactive.text : colors.text.secondary}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = ({ colors, spacing, radii }: Theme) => ({
  iconBox: { position: 'relative' as const },
  pill: {
    position: 'absolute' as const,
    width: spacing['4xl'],
    height: spacing['2xl'],
    borderRadius: radii.full,
    backgroundColor: colors.interactive.main,
  },
});
