import React, { memo, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { motion, moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const SIZE = moderateScale(54);
const STROKE = moderateScale(5);
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Starts at 12 o'clock and fills clockwise; a transform, not a layout direction, so RTL doesn't flip it.
const styles = StyleSheet.create({
  svg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ReadinessRingProps {
  done: number;
  total: number;
}

/** How much of a draft is filled, as a ring that draws itself once (final state at once under reduced motion). */
const ReadinessRingComponent: React.FC<ReadinessRingProps> = ({ done, total }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const target = total === 0 ? 0 : Math.min(1, done / total);
  const progress = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? target
      : withTiming(target, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [progress, reduceMotion, target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <Box
      width={SIZE}
      height={SIZE}
      align="center"
      justify="center"
      accessible
      accessibilityLabel={t('marketplace.campaign.list.readinessA11y', { done, total })}
    >
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.surface.elevated} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.interactive.main}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
      <Text variant="label" color={colors.text.primary}>
        {t('marketplace.campaign.list.readiness', { done, total })}
      </Text>
    </Box>
  );
};

export const ReadinessRing = memo(ReadinessRingComponent);
