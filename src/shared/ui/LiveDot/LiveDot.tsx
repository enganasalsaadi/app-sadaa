import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

export interface LiveDotProps {
  /** Fill of the dot and its ripples (a hue `main`, or a glass icon color on navy). */
  color: string;
  /** Dot diameter; defaults to the `control.dot` size. */
  size?: number;
}

/** How far a ripple grows before it fades out (rule 09 §3.1 status pulse). */
const RIPPLE_SCALE = 2.6;
const RIPPLE_OPACITY = 0.55;
const EASE_OUT = Easing.bezier(0.2, 0.7, 0.3, 1);

const Ripple = memo<{ progress: SharedValue<number>; color: string; size: number }>(
  ({ progress, color, size }) => {
    const style = useAnimatedStyle(() => ({
      opacity: RIPPLE_OPACITY * (1 - progress.value),
      transform: [{ scale: 1 + (RIPPLE_SCALE - 1) * progress.value }],
    }));
    return (
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
        <Box width={size} height={size} borderRadius="full" bg={color} />
      </Animated.View>
    );
  },
);

/**
 * A dot that means "happening now": two ripples leave it half a cycle apart, forever
 * (one of the three allowed loops). Reduced motion leaves the still dot. Decorative:
 * the text next to it carries the meaning.
 */
const LiveDotComponent: React.FC<LiveDotProps> = ({ color, size }) => {
  const { sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const diameter = size ?? sizes.control.dot;
  const first = useSharedValue(0);
  const second = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const cycle = withTiming(1, { duration: motion.loop.statusPulse, easing: EASE_OUT });
    first.value = withRepeat(cycle, -1, false);
    second.value = withDelay(motion.loop.statusPulse / 2, withRepeat(cycle, -1, false));
    return () => {
      cancelAnimation(first);
      cancelAnimation(second);
    };
  }, [first, second, reduceMotion]);

  return (
    <Box
      width={diameter}
      height={diameter}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {reduceMotion ? null : (
        <>
          <Ripple progress={first} color={color} size={diameter} />
          <Ripple progress={second} color={color} size={diameter} />
        </>
      )}
      <Box width={diameter} height={diameter} borderRadius="full" bg={color} />
    </Box>
  );
};

export const LiveDot = memo(LiveDotComponent);
