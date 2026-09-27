import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

export type StepProgressTone = 'onBrand' | 'surface';

export interface StepProgressProps {
  /** 1-based index of the active step. */
  current: number;
  total: number;
  accessibilityLabel: string;
  /** `onBrand` over the navy hero, `surface` on neutral backgrounds. */
  tone?: StepProgressTone;
}

interface SegmentProps {
  filled: boolean;
  trackColor: string;
  fillColor: string;
  isRTL: boolean;
}

// Fill grows with scaleX (transform only — no layout pass per frame) from the
// reading-start edge.
const Segment: React.FC<SegmentProps> = memo(
  ({ filled, trackColor, fillColor, isRTL }) => {
    const { sizes } = useTheme();
    const reduceMotion = useReducedMotion();
    const progress = useSharedValue(filled ? 1 : 0);

    useEffect(() => {
      const target = filled ? 1 : 0;
      progress.value = reduceMotion ? target : withSpring(target, motion.spring);
    }, [filled, progress, reduceMotion]);

    const fillStyle = useAnimatedStyle(() => ({
      transform: [{ scaleX: progress.value }],
    }));

    return (
      <Box
        flex={1}
        height={sizes.progress.track}
        borderRadius="full"
        bg={trackColor}
        overflow="hidden"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            isRTL ? styles.originRtl : styles.originLtr,
            { backgroundColor: fillColor },
            fillStyle,
          ]}
        />
      </Box>
    );
  },
);

const styles = StyleSheet.create({
  // transformOrigin is physical, so pick the reading-start edge explicitly.
  originLtr: { transformOrigin: 'left' },
  originRtl: { transformOrigin: 'right' },
});

const StepProgressComponent: React.FC<StepProgressProps> = ({
  current,
  total,
  accessibilityLabel,
  tone = 'onBrand',
}) => {
  const { colors, isRTL } = useTheme();
  const trackColor =
    tone === 'onBrand' ? colors.glass.progressTrack : colors.border.default;
  const fillColor =
    tone === 'onBrand' ? colors.glass.progressFill : colors.interactive.main;

  return (
    <Box
      row
      gap="xs"
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Segment
          key={i}
          filled={i < current}
          trackColor={trackColor}
          fillColor={fillColor}
          isRTL={isRTL}
        />
      ))}
    </Box>
  );
};

export const StepProgress = memo(StepProgressComponent);
