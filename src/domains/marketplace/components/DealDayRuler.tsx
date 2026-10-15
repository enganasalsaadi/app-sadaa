import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Vibration,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DealStripes } from './DealStripes';

const RULER_HEIGHT = moderateScale(64);
const TICK = {
  rest: moderateScale(14),
  stretched: moderateScale(22),
  base: moderateScale(28),
  picked: moderateScale(38),
};
const TICK_WIDTH = 2;
const PICKED_WIDTH = 4;
const BAND = moderateScale(6);
const ADJUST = [{ name: 'increment' }, { name: 'decrement' }] as const;

export interface DealDayRulerProps {
  /** Today's days: the tall grey tick the stretch starts from. */
  current: number;
  max: number;
  value: number;
  onChange: (days: number) => void;
  accessibilityLabel: string;
  accessibilityValue: string;
}

/**
 * Scrub the new delivery time: one tick per day from today's up to the cap. Drag or tap snaps to
 * a day with a light haptic; the days being added fill teal under a striped band. Screen readers
 * adjust it a day at a time.
 */
const DealDayRulerComponent: React.FC<DealDayRulerProps> = ({
  current,
  max,
  value,
  onChange,
  accessibilityLabel,
  accessibilityValue,
}) => {
  const { colors, isRTL } = useTheme();
  const count = max - current + 1;
  const [width, setWidth] = useState(0);
  const last = useRef(value);
  last.current = value;

  const pick = useCallback(
    (days: number) => {
      if (days === last.current) return;
      last.current = days;
      Vibration.vibrate(HAPTIC_TAP_MS);
      onChange(days);
    },
    [onChange],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    [],
  );

  /** The day under the finger, never today's (that's no extension). */
  const dayAt = (x: number) => {
    'worklet';
    const along = isRTL ? width - x : x;
    return (
      current +
      Math.min(count - 1, Math.max(1, Math.floor((along / width) * count)))
    );
  };
  const pan = Gesture.Pan()
    .minDistance(0)
    .failOffsetY([-12, 12])
    .enabled(width > 0)
    .onBegin(event => {
      scheduleOnRN(pick, dayAt(event.x));
    })
    .onChange(event => {
      scheduleOnRN(pick, dayAt(event.x));
    });

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const step = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      const next = Math.min(max, Math.max(current + 1, value + step));
      pick(next);
    },
    [current, max, pick, value],
  );

  const added = value - current;
  const styles = useStyles(
    ({ radii }): Record<'ruler' | 'band', ViewStyle> => ({
      ruler: {
        height: RULER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'flex-end',
      },
      band: {
        position: 'absolute',
        top: 0,
        start: `${(0.5 / count) * 100}%`,
        width: `${(added / count) * 100}%`,
        height: BAND,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.interactive.soft,
      },
    }),
    [added, colors.interactive.soft, count],
  );

  return (
    <GestureDetector gesture={pan}>
      <Box
        style={styles.ruler}
        onLayout={onLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: accessibilityValue }}
        accessibilityActions={ADJUST}
        onAccessibilityAction={onAccessibilityAction}
      >
        <Box style={styles.band} pointerEvents="none">
          <DealStripes color={colors.interactive.main} />
        </Box>
        {Array.from({ length: count }, (_, index) => {
          const days = current + index;
          const look =
            days === current
              ? 'base'
              : days === value
              ? 'picked'
              : days < value
              ? 'stretched'
              : 'rest';
          return <Tick key={days} days={days} look={look} />;
        })}
      </Box>
    </GestureDetector>
  );
};

type TickLook = keyof typeof TICK;

const Tick = memo<{ days: number; look: TickLook }>(({ days, look }) => {
  const { colors } = useTheme();
  const color =
    look === 'base'
      ? colors.text.tertiary
      : look === 'rest'
      ? colors.border.default
      : colors.interactive.main;
  const styles = useStyles(
    ({ radii, spacing }): Record<'cell' | 'line', ViewStyle> => ({
      cell: { flex: 1, alignItems: 'center', gap: spacing.xs },
      line: {
        width: look === 'picked' ? PICKED_WIDTH : TICK_WIDTH,
        height: TICK[look],
        borderRadius: radii.full,
        backgroundColor: color,
      },
    }),
    [color, look],
  );
  return (
    <Box style={styles.cell} pointerEvents="none">
      <Box style={styles.line} />
      <Text
        variant={look === 'picked' ? 'buttonSmall' : 'caption'}
        color={
          look === 'picked' ? colors.interactive.text : colors.text.tertiary
        }
      >
        {formatNumber(days)}
      </Text>
    </Box>
  );
});

export const DealDayRuler = memo(DealDayRulerComponent);
