import React, { memo, useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

export interface MoneyFlowProps {
  /** Mint (`money.main`) by default; `glass.iconMoney` over navy. */
  color?: string;
}

/**
 * Mint dots travelling toward the reading end: money on its way (escrow → wallet,
 * pending payout). One of the three allowed loops (rule 09 §3.1); reduced motion
 * leaves still dots. Decorative: the label next to it says where the money is.
 * Fills the width it is given.
 */
const MoneyFlowComponent: React.FC<MoneyFlowProps> = ({ color }) => {
  const { colors, sizes, spacing, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const shift = useSharedValue(0);
  const dot = sizes.dot.sm;
  const step = spacing.md;
  const count = width > 0 ? Math.ceil(width / step) + 1 : 0;

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    shift.value = 0;
    shift.value = withRepeat(
      withTiming(1, { duration: motion.loop.moneyFlow, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(shift);
  }, [reduceMotion, shift, width]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth(prev => (prev === next ? prev : next));
  }, []);

  const styles = useStyles(
    (): { row: ViewStyle } => ({
      // One dot-step wider than the track and pulled back by one step, so the loop seam is off-screen.
      row: { flexDirection: 'row', alignItems: 'center', gap: step - dot, marginStart: -step },
    }),
    [step, dot],
  );
  // Moving toward the reading end: right in LTR, left in RTL.
  const flowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (isRTL ? -1 : 1) * step * shift.value }],
  }));

  return (
    <Box
      flex={1}
      height={dot}
      overflow="hidden"
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.row, flowStyle]}>
        {Array.from({ length: count }, (_, index) => (
          <Box key={index} width={dot} height={dot} borderRadius="full" bg={color ?? colors.money.main} />
        ))}
      </Animated.View>
    </Box>
  );
};

export const MoneyFlow = memo(MoneyFlowComponent);
