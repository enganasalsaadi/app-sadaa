import React, { memo, useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Skeleton } from '../Skeleton';
import { isLabelShown, toBarRatios } from './barChartLayout';

/** `money` only when the bars are money coming in (earnings, rule 08); spend and counts stay `neutral`. */
export type BarChartTone = 'money' | 'neutral';

export interface BarChartDatum {
  /** Stable identity (`2026-10`): a bar keeps its column when the period changes. */
  key: string;
  /** Axis label under the bar (short month). */
  label: string;
  value: number;
}

export interface BarChartProps {
  /** Oldest → newest; time flips in RTL with the row. */
  data: readonly BarChartDatum[];
  /** What the chart says in words ("Earnings, last 6 months: 7,550 $"); the bars are hidden from screen readers. */
  accessibilityLabel: string;
  /** The bar to emphasise (current month). Default: the newest. */
  highlightIndex?: number;
  /** Bubble above the highlighted bar (its formatted value). */
  highlightLabel?: string;
  tone?: BarChartTone;
  /** Whole chart height, bubble included. */
  height?: number;
  loading?: boolean;
}

const DEFAULT_HEIGHT = moderateScale(140);
/** A zero month still shows a stub, so the axis reads as "nothing" rather than "missing". */
const MIN_BAR = moderateScale(4);
const BAR_WIDTH = '62%';
const GROW_EASING = Easing.bezier(0.22, 1, 0.36, 1);

interface BarProps {
  index: number;
  barHeight: number;
  color: string;
  growOnMount: boolean;
  style: ViewStyle;
}

/** Grows from the axis once, on mount (rule 09 §3.1); later heights snap. */
const Bar = memo<BarProps>(({ index, barHeight, color, growOnMount, style }) => {
  const progress = useSharedValue(growOnMount ? 0 : 1);

  useEffect(() => {
    if (progress.value === 1) return;
    progress.value = withDelay(
      index * motion.stagger,
      withTiming(1, { duration: motion.duration.draw, easing: GROW_EASING }),
    );
  }, [index, progress]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scaleY: progress.value }] }));

  return (
    <Animated.View style={[style, animated]}>
      <Box height={barHeight} borderRadius="sm" bg={color} />
    </Animated.View>
  );
});

/**
 * Monthly bars without axes or grid (earnings, campaign spend). The highlighted bar
 * carries a value bubble; labels thin out to every other month on long series.
 * Fills its parent's width.
 */
const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  accessibilityLabel,
  highlightIndex,
  highlightLabel,
  tone = 'neutral',
  height = DEFAULT_HEIGHT,
  loading = false,
}) => {
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const highlight = highlightIndex ?? data.length - 1;
  const ratios = useMemo(() => toBarRatios(data.map(datum => datum.value)), [data]);

  const palette =
    tone === 'money'
      ? { rest: colors.money.soft, current: colors.money.main, bubble: colors.money.soft, bubbleText: colors.money.text }
      : {
          rest: colors.surface.elevated,
          current: colors.text.secondary,
          bubble: colors.surface.elevated,
          bubbleText: colors.text.primary,
        };

  // The bubble's row is reserved above every bar so the tallest bar never hits it.
  const bubbleRow = typography.caption.lineHeight + spacing.xs * 2 + spacing.xs;
  const plotHeight = Math.max(height - bubbleRow, MIN_BAR);

  const styles = useStyles(
    (): { bar: ViewStyle } => ({
      bar: { width: BAR_WIDTH, transformOrigin: 'bottom' },
    }),
  );

  if (loading) {
    return <Skeleton width="100%" height={height + typography.caption.lineHeight} borderRadius="md" />;
  }

  return (
    <Box gap="sm" accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Box row height={height} align="flex-end" gap="sm" importantForAccessibility="no-hide-descendants">
        {data.map((datum, index) => {
          const isCurrent = index === highlight;
          const barHeight = Math.max(Math.round((ratios[index] ?? 0) * plotHeight), MIN_BAR);
          return (
            <Box key={datum.key} flex={1} align="center" justify="flex-end" gap="xs">
              {isCurrent && highlightLabel ? (
                <Box px="sm" py="xs" borderRadius="full" bg={palette.bubble}>
                  <Text variant="caption" color={palette.bubbleText} numberOfLines={1}>
                    {highlightLabel}
                  </Text>
                </Box>
              ) : null}
              <Bar
                index={index}
                barHeight={barHeight}
                color={isCurrent ? palette.current : palette.rest}
                growOnMount={!reduceMotion}
                style={styles.bar}
              />
            </Box>
          );
        })}
      </Box>
      <Box row gap="sm" importantForAccessibility="no-hide-descendants">
        {data.map((datum, index) => (
          <Box key={datum.key} flex={1} align="center">
            {isLabelShown(index, data.length, highlight) ? (
              <Text
                variant="caption"
                color={index === highlight ? colors.text.primary : colors.text.tertiary}
                numberOfLines={1}
              >
                {datum.label}
              </Text>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const BarChart = memo(BarChartComponent);
