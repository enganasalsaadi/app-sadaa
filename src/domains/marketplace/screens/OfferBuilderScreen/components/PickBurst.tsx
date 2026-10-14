import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';

const RISE = moderateScale(30);

export interface PickBurstProps {
  picked: boolean;
}

/**
 * One small heart floating up out of its parent the moment `picked` turns on. Restored picks
 * (mount with `picked`) and reduced motion stay quiet. Fills the parent, so place it inside the
 * element it should rise from.
 */
const PickBurstComponent: React.FC<PickBurstProps> = ({ picked }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const wasPicked = useRef(picked);
  // 1 = at rest (invisible); a pick replays 0 → 1.
  const progress = useSharedValue(1);

  useEffect(() => {
    if (picked && !wasPicked.current && !reduceMotion) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: motion.pickBurst, easing: Easing.out(Easing.cubic) });
    }
    wasPicked.current = picked;
  }, [picked, progress, reduceMotion]);

  const styles = useStyles(
    (): Record<'fill', ViewStyle> => ({
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      },
    }),
    [],
  );
  const heartStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25, 1], [0, 0.9, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.25, 1], [RISE * 0.15, -RISE * 0.15, -RISE]) },
      { scale: interpolate(progress.value, [0, 0.25, 1], [0.4, 1.1, 0.8]) },
    ],
  }));

  return (
    <Animated.View style={[styles.fill, heartStyle]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Heart size={sizes.icon.xs} color={colors.interactive.main} fill={colors.interactive.main} />
    </Animated.View>
  );
};

export const PickBurst = memo(PickBurstComponent);
