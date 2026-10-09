import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { STATE_LABEL, TimelineMarker } from './TimelineMarker';
import type { TimelineStep, TimelineStepState } from './types';

const NODE_SIZE = moderateScale(28);
const DRAW_EASING = Easing.bezier(0.22, 1, 0.36, 1);

/** The stage the fill reaches: the current (or stopped) one, else the last done one. */
const reachedIndex = (steps: readonly TimelineStep[]): number => {
  const active = steps.findIndex(step => step.state === 'current' || step.state === 'error');
  if (active >= 0) return active;
  return steps.reduce((last, step, index) => (step.state === 'done' ? index : last), -1);
};

const TrackLabel = memo<{ title: string; state: TimelineStepState }>(({ title, state }) => {
  const { colors } = useTheme();
  const color = {
    done: colors.text.secondary,
    current: colors.interactive.text,
    upcoming: colors.text.tertiary,
    error: colors.status.danger.text,
  }[state];
  return (
    <Text variant="caption" color={color} align="center" numberOfLines={2}>
      {title}
    </Text>
  );
});

/**
 * Horizontal stage track (rule 09 §3.1): one node per stage, a line between the
 * first and last node centres, and a teal fill that draws once to the stage reached.
 * The fill starts at the reading-start edge, so it runs right to left in Arabic.
 */
const TimelineTrackComponent: React.FC<{ steps: readonly TimelineStep[] }> = ({ steps }) => {
  const { t } = useTranslation();
  const { colors, borderWidths } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const drawn = useRef(false);
  const fill = useSharedValue(0);

  const count = steps.length;
  const slot = count > 0 ? width / count : 0;
  const lineWidth = slot * Math.max(count - 1, 0);
  const reached = reachedIndex(steps);
  const fillTarget = count > 1 && reached > 0 ? (reached / (count - 1)) * lineWidth : 0;

  useEffect(() => {
    if (width === 0) return;
    if (reduceMotion || drawn.current) {
      fill.value = fillTarget;
      return;
    }
    drawn.current = true;
    fill.value = withTiming(fillTarget, { duration: motion.duration.draw, easing: DRAW_EASING });
  }, [fill, fillTarget, reduceMotion, width]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth(prev => (prev === next ? prev : next));
  }, []);

  const styles = useStyles(
    (): { line: ViewStyle } => ({
      line: {
        position: 'absolute',
        top: (NODE_SIZE - borderWidths.lg) / 2,
        start: slot / 2,
        width: lineWidth,
        height: borderWidths.lg,
      },
    }),
    [slot, lineWidth, borderWidths.lg],
  );
  const fillStyle = useAnimatedStyle(() => ({ width: fill.value }));

  const a11yLabel = useMemo(
    () => steps.map(step => `${step.title}, ${t(STATE_LABEL[step.state])}`).join('. '),
    [steps, t],
  );

  return (
    <Box onLayout={onLayout} accessible accessibilityLabel={a11yLabel}>
      {width > 0 && count > 1 ? (
        <>
          <Box style={styles.line} borderRadius="full" bg={colors.border.default} />
          <Animated.View style={[styles.line, fillStyle]}>
            <Box flex={1} borderRadius="full" bg={colors.interactive.main} />
          </Animated.View>
        </>
      ) : null}
      <Box row>
        {steps.map(step => (
          <Box key={step.key} flex={1} align="center" gap="xs" px="xs">
            <TimelineMarker state={step.state} size={NODE_SIZE} />
            <TrackLabel title={step.title} state={step.state} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const TimelineTrack = memo(TimelineTrackComponent);
