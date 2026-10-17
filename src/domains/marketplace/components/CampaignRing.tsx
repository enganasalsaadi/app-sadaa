import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { motion, moderateScale } from '@/core/theme';
import { Box } from '@/shared/ui';

// Starts at 12 o'clock and fills clockwise; a transform, not a layout direction, so RTL doesn't flip it.
const styles = StyleSheet.create({
  svg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CampaignRingProps {
  /** 0–1: how much of the ring is drawn. */
  progress: number;
  color: string;
  trackColor: string;
  /** Outer diameter in design points (scaled). */
  size: number;
  strokeWidth: number;
  accessibilityLabel: string;
  /** Centered inside the ring. */
  children?: React.ReactNode;
}

/** A progress ring that draws itself to its value (final state at once under reduced motion). */
const CampaignRingComponent: React.FC<CampaignRingProps> = ({
  progress: value,
  color,
  trackColor,
  size,
  strokeWidth,
  accessibilityLabel,
  children,
}) => {
  const reduceMotion = useReducedMotion();
  const diameter = moderateScale(size);
  const stroke = moderateScale(strokeWidth);
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.min(1, Math.max(0, value));
  const progress = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? target
      : withTiming(target, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [progress, reduceMotion, target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Box width={diameter} height={diameter} align="center" justify="center" accessible accessibilityLabel={accessibilityLabel}>
      <Svg width={diameter} height={diameter} style={styles.svg}>
        <Circle cx={diameter / 2} cy={diameter / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </Box>
  );
};

export const CampaignRing = memo(CampaignRingComponent);
