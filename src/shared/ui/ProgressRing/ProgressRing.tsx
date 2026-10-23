import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/core/theme';
import { Box } from '../primitives/Box';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** 0–1. */
  progress: number;
  /** Outer diameter. */
  size: number;
  /** Ring thickness. */
  stroke: number;
  color: string;
  track: string;
  /** Centered inside the ring (a percent, a count, an icon). */
  children?: React.ReactNode;
}

/**
 * A determinate progress ring (a file downloading, a run counting up). Starts at 12 o'clock and
 * fills clockwise in both directions of reading (time, not text). Eases to each new value;
 * reduced motion jumps.
 */
const ProgressRingComponent: React.FC<ProgressRingProps> = ({
  progress,
  size,
  stroke,
  color,
  track,
  children,
}) => {
  const reduceMotion = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const shown = useSharedValue(progress);

  useEffect(() => {
    const target = Math.min(Math.max(progress, 0), 1);
    shown.value = reduceMotion ? target : withTiming(target, { duration: motion.duration.fast });
  }, [progress, reduceMotion, shown]);

  const arc = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - shown.value),
  }));

  return (
    <Box width={size} height={size} align="center" justify="center">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={arc}
          // Start at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </Box>
  );
};

export const ProgressRing = memo(ProgressRingComponent);
