import React, { memo, useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion, useTheme } from '@/core/theme';
import type { RadiiToken } from '@/core/theme';
import { Box } from '../primitives/Box';

export interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: RadiiToken;
  /** Stretch absolutely over the parent (e.g. an image loading overlay). */
  fill?: boolean;
}

/** Placeholder block with a soft opacity pulse (UI thread, stops under reduced motion). */
const SkeletonComponent: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 'md',
  fill = false,
}) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withTiming(0.45, { duration: motion.duration.pulse, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[fill && StyleSheet.absoluteFill, style]}>
      <Box
        width={width}
        height={height}
        borderRadius={borderRadius}
        bg={colors.surface.elevated}
      />
    </Animated.View>
  );
};

export const Skeleton = memo(SkeletonComponent);
