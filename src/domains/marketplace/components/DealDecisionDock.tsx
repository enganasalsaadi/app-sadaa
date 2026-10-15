import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useCountdown } from '@/core/hooks';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import { DEAL_LATE_SECONDS, formatClock } from '../utils/dealTimer';

const SECONDS_PER_HOUR = 3600;
/** More ticks than this and one tick stands for several hours. */
const MAX_TICKS = 48;
/** A longer tick every this many: the ruler's quarter-days. */
const MAJOR_EVERY = 6;
const TICK = moderateScale(6);
const MAJOR = moderateScale(11);
const TICK_GAP = moderateScale(3);
const PULSE_LOW = 0.35;

export interface DealDockClock {
  /** The decision's deadline (rule 06: from `due_at` only). */
  dueAt: number;
  /** Full length of the window, only to draw the ruler; `null` = no ruler. */
  windowHours: number | null;
  /** Before the clock: «بانتظار الرد». */
  lead: string;
}

export interface DealDecisionDockProps {
  /** `null`: nothing is timed (funding keeps its clock in the funding card). */
  clock: DealDockClock | null;
  children: React.ReactNode;
}

interface RulerTones {
  lit: string;
  gone: string;
}

/** The tick for the hour running now: breathes while time runs (still under reduced motion). */
const NowTick = memo<{ style: StyleProp<ViewStyle> }>(({ style }) => {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(PULSE_LOW, { duration: motion.loop.rulerPulse }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);
  const animated = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[style, animated]} />;
});

/**
 * One tick per hour of the window (or per few hours on long windows): the ones gone dim from the
 * reading start, the current one breathes, a longer tick every six. Re-renders only when a tick
 * goes out, not every second.
 */
const Ruler = memo<{ total: number; remaining: number; tones: RulerTones }>(
  ({ total, remaining, tones }) => {
    const styles = useStyles(
      ({
        radii,
      }): Record<'row' | 'tick' | 'major' | 'live' | 'gone', ViewStyle> => ({
        row: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: TICK_GAP,
          height: MAJOR,
        },
        tick: { flex: 1, height: TICK, borderRadius: radii.xs },
        major: { height: MAJOR },
        live: { backgroundColor: tones.lit },
        gone: { backgroundColor: tones.gone },
      }),
      [tones.gone, tones.lit],
    );
    const now = total - remaining;
    return (
      <Box style={styles.row} pointerEvents="none">
        {Array.from({ length: total }, (_, index) => {
          const style = [
            styles.tick,
            index % MAJOR_EVERY === 0 && styles.major,
            index < now ? styles.gone : styles.live,
          ];
          return index === now ? (
            <NowTick key={index} style={style} />
          ) : (
            <Box key={index} style={style} />
          );
        })}
      </Box>
    );
  },
);

/**
 * «The hours ruler» (approved 2026-10-15, direction B, slimmed the same day): the decision bar
 * docked under a deal waiting on someone. One thin time strip (live dot, what it waits on, the
 * clock; a hairline ruler of the window's hours right under it) over the actions. Under 12 hours
 * left the strip warms to amber. Sits in `Layout`'s `docked` footer, which draws the surface,
 * hairline and insets.
 */
const DealDecisionDockComponent: React.FC<DealDecisionDockProps> = ({
  clock,
  children,
}) => {
  const { colors } = useTheme();
  const seconds = useCountdown(clock?.dueAt ?? null);
  const timed = clock !== null && seconds > 0;
  const late = timed && seconds < DEAL_LATE_SECONDS;
  const windowHours = clock?.windowHours ?? null;
  const perTick =
    windowHours !== null && windowHours > 0
      ? Math.max(1, Math.ceil(windowHours / MAX_TICKS))
      : null;
  const total =
    perTick !== null && windowHours !== null
      ? Math.ceil(windowHours / perTick)
      : 0;
  const remaining =
    perTick !== null
      ? Math.min(total, Math.ceil(seconds / (perTick * SECONDS_PER_HOUR)))
      : 0;
  const accent = late ? colors.status.warning.main : colors.interactive.main;

  const styles = useStyles(
    ({ spacing }): Record<'time' | 'clock' | 'actions', ViewStyle> => ({
      time: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        backgroundColor: late
          ? colors.status.warning.soft
          : colors.surface.elevated,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border.default,
      },
      // A clock reads left to right in either language.
      clock: { direction: 'ltr' },
      // The footer slot already pads by the home-indicator inset.
      actions: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
      },
    }),
    [
      colors.border.default,
      colors.status.warning.soft,
      colors.surface.elevated,
      late,
    ],
  );
  // Stable between ticks so the ruler only redraws when an hour goes out.
  const tones = useMemo<RulerTones>(
    () =>
      late
        ? { lit: colors.status.warning.main, gone: colors.border.strong }
        : { lit: colors.interactive.main, gone: colors.border.default },
    [
      colors.border.default,
      colors.border.strong,
      colors.interactive.main,
      colors.status.warning.main,
      late,
    ],
  );

  return (
    <Box>
      {timed ? (
        <Box style={styles.time}>
          <Box row align="center" gap="sm" accessible>
            <LiveDot color={accent} />
            <Box flex={1}>
              <Text
                variant="caption"
                color={late ? colors.status.warning.text : colors.text.secondary}
                numberOfLines={1}
              >
                {clock.lead}
              </Text>
            </Box>
            <Text
              variant="amountSmall"
              color={late ? colors.status.warning.text : colors.text.primary}
              style={styles.clock}
            >
              {formatClock(seconds)}
            </Text>
          </Box>
          {total > 0 ? (
            <Ruler total={total} remaining={remaining} tones={tones} />
          ) : null}
        </Box>
      ) : null}
      <Box style={styles.actions}>{children}</Box>
    </Box>
  );
};

export const DealDecisionDock = memo(DealDecisionDockComponent);
