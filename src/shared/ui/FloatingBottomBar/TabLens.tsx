import React, { memo, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { LENS_INSET_X, LENS_INSET_Y } from './constants';

/** A thin bright rim at the top, then the glass fading toward the bottom. */
const LENS_STOPS = [0, 0.06, 1];

interface TabLensProps {
  index: number;
  count: number;
  barWidth: number;
  barHeight: number;
}

/**
 * Liquid lens under the active tab (rule 08 v4): white glass, bright at the top edge,
 * that springs to the new tab with a small overshoot. Reduced motion jumps instead.
 */
const TabLensComponent: React.FC<TabLensProps> = ({ index, count, barWidth, barHeight }) => {
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const slot = count > 0 ? barWidth / count : 0;
  // translateX is physical; `start` already puts the lens on the first tab in either direction.
  const target = (isRTL ? -1 : 1) * index * slot;
  const x = useSharedValue(target);

  useEffect(() => {
    x.value = reduceMotion ? target : withSpring(target, motion.lensSpring);
  }, [reduceMotion, target, x]);

  const height = barHeight - LENS_INSET_Y * 2;
  const styles = useStyles(
    (): { lens: ViewStyle } => ({
      lens: {
        position: 'absolute',
        top: LENS_INSET_Y,
        start: LENS_INSET_X,
        width: Math.max(slot - LENS_INSET_X * 2, 0),
        height,
        borderRadius: height / 2,
        overflow: 'hidden',
      },
    }),
    [slot, height],
  );
  const moveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const { glassRim, lens, lensFaint } = colors.navigation.tabBar;

  if (slot === 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.lens, moveStyle]}>
      <LinearGradient colors={[glassRim, lens, lensFaint]} locations={LENS_STOPS} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};

export const TabLens = memo(TabLensComponent);
