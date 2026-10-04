import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion, resolveHue, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type ProgressBarTone = 'interactive' | 'money' | 'premium' | 'success' | 'warning' | 'danger';
export type ProgressBarSize = 'sm' | 'md';
/** `brand`: on a navy hero/header — glass track, light fill, on-brand labels (`tone` is ignored). */
export type ProgressBarSurface = 'default' | 'brand';

export interface ProgressBarProps {
  /** 0–1, clamped. */
  value: number;
  accessibilityLabel: string;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  label?: string;
  /** Pre-formatted by the caller (`formatNumber` / `formatMoney`), shown at the reading end. */
  valueLabel?: string;
  /** Default `default`. */
  surface?: ProgressBarSurface;
}

const clamp = (n: number): number => Math.min(1, Math.max(0, n));

/** Continuous progress (campaign budget spent, profile completeness). Discrete steps → `StepProgress`. */
const ProgressBarComponent: React.FC<ProgressBarProps> = ({
  value,
  accessibilityLabel,
  tone = 'interactive',
  size = 'sm',
  label,
  valueLabel,
  surface = 'default',
}) => {
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const target = clamp(value);
  const progress = useSharedValue(target);
  const onBrand = surface === 'brand';
  const trackColor = onBrand ? colors.glass.progressTrack : colors.surface.elevated;
  const fillColor = onBrand ? colors.glass.progressFill : resolveHue(colors, tone).main;

  useEffect(() => {
    progress.value = reduceMotion ? target : withSpring(target, motion.spring);
  }, [target, progress, reduceMotion]);

  // scaleX keeps the fill on the UI thread with no layout pass per frame.
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Box
      gap="xs"
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
    >
      {label || valueLabel ? (
        <Box row justify="space-between" gap="md">
          <Text
            variant="bodySmall"
            color={onBrand ? colors.text.onBrandMuted : colors.text.secondary}
          >
            {label}
          </Text>
          <Text variant="bodySmall" color={onBrand ? colors.text.onBrand : undefined}>
            {valueLabel}
          </Text>
        </Box>
      ) : null}
      <Box
        height={size === 'md' ? sizes.progress.thick : sizes.progress.track}
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
    </Box>
  );
};

const styles = StyleSheet.create({
  // transformOrigin is physical, so pick the reading-start edge explicitly.
  originLtr: { transformOrigin: 'left' },
  originRtl: { transformOrigin: 'right' },
});

export const ProgressBar = memo(ProgressBarComponent);
