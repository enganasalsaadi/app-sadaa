import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const BAR_HEIGHT = moderateScale(8);

interface ClockBarProps {
  /** 0–1 of the bar still full; it drains toward the deadline. */
  share: number;
  /** Time is short: the fill turns amber (rule 08: warning = time is short). */
  hot: boolean;
}

/** The deadline as a bar that empties; it grows to its level once on mount, then follows `share`. */
const ClockBarComponent: React.FC<ClockBarProps> = ({ share, hot }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const level = useSharedValue(reduceMotion ? share : 0);

  useEffect(() => {
    level.value = reduceMotion ? share : withTiming(share, { duration: motion.duration.draw });
  }, [level, reduceMotion, share]);

  const styles = useStyles(
    ({ radii }): Record<'fill', ViewStyle> => ({
      fill: { height: '100%', borderRadius: radii.full },
    }),
    [],
  );
  const fillStyle = useAnimatedStyle(() => ({ width: `${level.value * 100}%` }));

  return (
    <Box
      flex={1}
      height={BAR_HEIGHT}
      borderRadius="full"
      bg={colors.surface.elevated}
      overflow="hidden"
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: hot ? colors.status.warning.main : colors.interactive.main },
          fillStyle,
        ]}
      />
    </Box>
  );
};

export const ClockBar = memo(ClockBarComponent);
