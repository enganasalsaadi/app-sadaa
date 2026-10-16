import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import {
  RAIL_GLOW_BLUR,
  RAIL_GLOW_Y,
  RAIL_HALF,
  RAIL_HEIGHT,
  RAIL_TRAIL_DELAY,
} from './constants';

interface TabRailProps {
  index: number;
  /** Tab the finger is on (not yet released), or null. */
  reach: number | null;
  count: number;
  /** Row width and its side padding: the tabs split what is left evenly. */
  width: number;
  inset: number;
}

/**
 * Elastic rail on the bar's top edge (approved 2026-10-16). Its two ends move on their own: the end
 * facing the new tab darts there, the other follows late with a rubbery give, so the rail
 * stretches then catches up like an inchworm. A finger resting on another tab already pulls the
 * leading end toward it; lifting off elsewhere lets it snap back. Reduced motion jumps.
 *
 * Ends are kept as logical distances from the start edge; `translateX` is physical, so it flips in RTL.
 */
const TabRailComponent: React.FC<TabRailProps> = ({ index, reach, count, width, inset }) => {
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const slot = count > 0 ? (width - inset * 2) / count : 0;
  const startEdge = useSharedValue(0);
  const endEdge = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (slot <= 0) return;
    const ends = (i: number) => {
      const centre = inset + (i + 0.5) * slot;
      return { start: centre - RAIL_HALF, end: centre + RAIL_HALF };
    };
    const target = ends(index);
    if (reduceMotion || !placed.current) {
      placed.current = true;
      startEdge.value = target.start;
      endEdge.value = target.end;
      return;
    }
    if (reach !== null && reach !== index) {
      const toward = ends(reach);
      if (toward.start > target.start) endEdge.value = withSpring(toward.end, motion.railLeadSpring);
      else startEdge.value = withSpring(toward.start, motion.railLeadSpring);
      return;
    }
    // Moving toward the end edge: the end-side tip leads. A cancelled reach settles the same way.
    if (target.start > startEdge.value) {
      endEdge.value = withSpring(target.end, motion.railLeadSpring);
      startEdge.value = withDelay(RAIL_TRAIL_DELAY, withSpring(target.start, motion.railTrailSpring));
    } else {
      startEdge.value = withSpring(target.start, motion.railLeadSpring);
      endEdge.value = withDelay(RAIL_TRAIL_DELAY, withSpring(target.end, motion.railTrailSpring));
    }
  }, [startEdge, index, inset, reach, reduceMotion, slot, endEdge]);

  const styles = useStyles(
    (): { rail: ViewStyle } => ({
      rail: {
        position: 'absolute',
        top: 0,
        start: 0,
        height: RAIL_HEIGHT,
        borderBottomStartRadius: RAIL_HEIGHT,
        borderBottomEndRadius: RAIL_HEIGHT,
        backgroundColor: colors.navigation.tabBar.active,
        boxShadow: [
          {
            offsetX: 0,
            offsetY: RAIL_GLOW_Y,
            blurRadius: RAIL_GLOW_BLUR,
            color: colors.navigation.tabBar.railGlow,
          },
        ],
      },
    }),
    [colors.navigation.tabBar.active, colors.navigation.tabBar.railGlow],
  );

  const direction = isRTL ? -1 : 1;
  const railStyle = useAnimatedStyle(() => ({
    width: Math.max(endEdge.value - startEdge.value, 0),
    transform: [{ translateX: direction * startEdge.value }],
  }));

  if (slot <= 0) return null;

  return <Animated.View pointerEvents="none" style={[styles.rail, railStyle]} />;
};

export const TabRail = memo(TabRailComponent);
