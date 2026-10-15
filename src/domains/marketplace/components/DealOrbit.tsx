import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Line,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Pressable,
  Text,
  useLayoutInView,
  useLoopClock,
} from '@/shared/ui';
import { DEAL_STATION_LABEL } from '../constants/dealCopy';
import { JOURNEY_STATUS_LABEL } from './DealJourneyRail';
import type { DealJourneyStage, DealJourneyStatus } from '../utils/dealJourney';
import type { DealStationState } from '../utils/dealStation';

const FULL_TURN = 360;
const TOP = -90;
const RING_GAP = moderateScale(26);
const OUTER_STROKE = 3;
const ARC_STROKE = 5;
const WINDOW_STROKE = 8;
const NODE_DONE = 7;
const NODE_NOW = 11;
const NODE_NOW_STROKE = 4;
const NODE_IDLE = 6;
const NODE_IDLE_STROKE = 2;
const CROSS = 5;
const COMET = 4;
const COMET_TAIL = 2.5;
const COMET_LAG = 0.06;
const COMET_TAIL_OPACITY = 0.5;
/** Air between a station's mark and its label, so names never touch the ring or a node. */
const LABEL_GAP = moderateScale(0);
const LABEL_CLEAR = NODE_NOW + NODE_NOW_STROKE + LABEL_GAP;
const LABEL_WIDTH = moderateScale(60);
const LABEL_HEIGHT = moderateScale(44);
const SWIPE = 40;
const MAX_RADIUS = moderateScale(118);
const MIN_RADIUS = moderateScale(72);

export interface DealOrbitProps {
  stages: DealJourneyStage[];
  state: DealStationState;
  /** Station whose card is open below. */
  selected: number;
  onSelect: (index: number) => void;
  /** Share of the current station's window already gone; `null` = no running window. */
  windowShare: number | null;
  /** Time is short, or the viewer must act: the inner ring turns amber. */
  windowWarn: boolean;
  /** Width the orbit may take. */
  width: number;
  /** The face and clock in the middle. */
  children: React.ReactNode;
}

interface Point {
  x: number;
  y: number;
}

/** Outward direction of station `index` of `count`, from the top toward the reading start (clockwise in RTL). */
const directionAt = (index: number, count: number, dir: number): Point => {
  const theta = ((index / count) * FULL_TURN * Math.PI) / 180;
  return { x: dir * Math.sin(theta), y: -Math.cos(theta) };
};

/** How far the label box reaches along `u` from its centre (support of the rectangle). */
const labelReach = (u: Point) =>
  (Math.abs(u.x) * LABEL_WIDTH) / 2 + (Math.abs(u.y) * LABEL_HEIGHT) / 2;

/** Centre of a label: pushed out along `u` until its box sits `LABEL_CLEAR` past the station. */
const labelOffset = (u: Point) => LABEL_CLEAR + labelReach(u);

interface OrbitGeometry {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
  directions: Point[];
}

/**
 * The largest ring whose station labels all fit inside `width`, every label clear of its
 * station; the height grows to hold the top and bottom labels.
 */
const orbitGeometry = (
  width: number,
  count: number,
  dir: number,
): OrbitGeometry => {
  const directions = Array.from({ length: count }, (_, index) =>
    directionAt(index, count, dir),
  );
  const half = width / 2;
  const radius = Math.max(
    MIN_RADIUS,
    directions.reduce((best, u) => {
      const side = Math.abs(u.x);
      if (side < 0.01) return best;
      const room = half - LABEL_WIDTH / 2 - side * labelOffset(u);
      return Math.min(best, room / side);
    }, MAX_RADIUS),
  );
  const reach = (sign: 1 | -1) =>
    directions.reduce(
      (most, u) =>
        Math.max(
          most,
          -sign * u.y * (radius + labelOffset(u)) + LABEL_HEIGHT / 2,
        ),
      radius + WINDOW_STROKE,
    );
  const above = reach(1);
  return {
    width,
    height: above + reach(-1),
    cx: half,
    cy: above,
    radius,
    directions,
  };
};

const arcPath = (
  cx: number,
  cy: number,
  radius: number,
  sweep: number,
  dir: number,
) => {
  const path = Skia.Path.Make();
  path.addArc(
    {
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
    },
    TOP,
    dir * sweep,
  );
  return path;
};

/**
 * The detail hero's signature (approved 2026-10-14): the whole deal as one orbit. The outer
 * arc is drawn from the first station up to now, the inner ring fills as the current window
 * runs out, and a comet runs toward the next station (paused off-screen and under reduced
 * motion). A dispute paints the current station red; a stopped deal freezes grey with a ✕ where
 * it ended. Tap a station or swipe the orbit to change the card below.
 */
const DealOrbitComponent: React.FC<DealOrbitProps> = ({
  stages,
  state,
  selected,
  onSelect,
  windowShare,
  windowWarn,
  width,
  children,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const dir = isRTL ? 1 : -1;
  const count = stages.length;
  const geometry = useMemo(
    () => orbitGeometry(width, count, dir),
    [count, dir, width],
  );
  const { cx, cy, radius: outer } = geometry;
  const inner = outer - RING_GAP;
  const nowIndex = Math.max(
    0,
    stages.findIndex(stage => stage.status === 'now'),
  );
  const stopped = state === 'stopped';
  const done = state === 'done';

  // Theme read outside the Canvas: Skia's renderer can't read React context.
  const tone = {
    track: colors.deal.orbitTrack,
    arc: stopped ? colors.deal.stopped : colors.deal.orbitArc,
    windowTrack: colors.deal.windowTrack,
    window: windowWarn ? colors.glass.iconWarning : colors.deal.windowFill,
    idle: colors.deal.stationIdle,
    hub: colors.brand.main,
    now:
      state === 'disputed'
        ? colors.glass.iconDanger
        : stopped
        ? colors.deal.stopped
        : colors.deal.orbitArc,
    comet: colors.deal.comet,
  };

  const points = useMemo(
    () =>
      geometry.directions.map(u => ({
        x: cx + u.x * outer,
        y: cy + u.y * outer,
      })),
    [cx, cy, geometry.directions, outer],
  );
  const progressArc = useMemo(
    () =>
      arcPath(
        cx,
        cy,
        outer,
        done ? FULL_TURN : (nowIndex / Math.max(1, count)) * FULL_TURN,
        dir,
      ),
    [count, cx, cy, dir, done, nowIndex, outer],
  );
  const windowArc = useMemo(
    () =>
      arcPath(
        cx,
        cy,
        inner,
        Math.min(1, Math.max(0, windowShare ?? 0)) * FULL_TURN,
        dir,
      ),
    [cx, cy, dir, inner, windowShare],
  );

  const reveal = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    reveal.value = withTiming(1, {
      duration: motion.duration.draw,
      easing: Easing.out(Easing.cubic),
    });
  }, [reduceMotion, reveal]);

  const { ref, onLayout, visible } = useLayoutInView({ track: true });
  const moving =
    visible && !reduceMotion && state === 'open' && nowIndex < count - 1;
  const clock = useLoopClock(motion.loop.comet, moving);
  const from = ((nowIndex / Math.max(1, count)) * FULL_TURN * Math.PI) / 180;
  const span = ((1 / Math.max(1, count)) * FULL_TURN * Math.PI) / 180;
  const cometX = useDerivedValue(
    () => cx + dir * outer * Math.sin(from + span * clock.value),
  );
  const cometY = useDerivedValue(
    () => cy - outer * Math.cos(from + span * clock.value),
  );
  const tailX = useDerivedValue(
    () =>
      cx +
      dir *
        outer *
        Math.sin(from + span * Math.max(0, clock.value - COMET_LAG)),
  );
  const tailY = useDerivedValue(
    () =>
      cy - outer * Math.cos(from + span * Math.max(0, clock.value - COMET_LAG)),
  );
  const cometOpacity = useDerivedValue(() =>
    moving ? Math.sin(Math.PI * clock.value) : 0,
  );

  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-20, 20])
        .failOffsetY([-14, 14])
        .onEnd(event => {
          if (Math.abs(event.translationX) < SWIPE) return;
          const forward = isRTL
            ? event.translationX > 0
            : event.translationX < 0;
          const next = Math.min(
            count - 1,
            Math.max(0, selected + (forward ? 1 : -1)),
          );
          if (next === selected) return;
          Vibration.vibrate(HAPTIC_TAP_MS);
          onSelect(next);
        }),
    [count, isRTL, onSelect, selected],
  );

  const styles = useStyles(
    (): Record<'orbit' | 'core', ViewStyle> => ({
      orbit: {
        width: geometry.width,
        height: geometry.height,
        alignSelf: 'center',
      },
      core: {
        position: 'absolute',
        top: cy - inner,
        start: cx - inner,
        width: inner * 2,
        height: inner * 2,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [cx, cy, geometry.height, geometry.width, inner],
  );

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View ref={ref} onLayout={onLayout} style={styles.orbit}>
        <Canvas style={styles.orbit} pointerEvents="none">
          <Circle
            cx={cx}
            cy={cy}
            r={outer}
            style="stroke"
            strokeWidth={OUTER_STROKE}
            color={tone.track}
          />
          <Path
            path={progressArc}
            style="stroke"
            strokeWidth={ARC_STROKE}
            strokeCap="round"
            color={tone.arc}
            end={reveal}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={inner}
            style="stroke"
            strokeWidth={WINDOW_STROKE}
            color={tone.windowTrack}
          />
          {windowShare !== null && !stopped ? (
            <Path
              path={windowArc}
              style="stroke"
              strokeWidth={WINDOW_STROKE}
              strokeCap="round"
              color={tone.window}
              end={reveal}
            />
          ) : null}
          {points.map((point, index) => {
            const stage = stages[index];
            if (!stage) return null;
            return (
              <StationMark
                key={stage.key}
                point={point}
                status={done ? 'done' : stage.status}
                stopped={stopped}
                tone={tone}
              />
            );
          })}
          <Group opacity={cometOpacity}>
            <Circle
              cx={tailX}
              cy={tailY}
              r={COMET_TAIL}
              color={tone.comet}
              opacity={COMET_TAIL_OPACITY}
            />
            <Circle cx={cometX} cy={cometY} r={COMET} color={tone.comet} />
          </Group>
        </Canvas>

        <Box style={styles.core} pointerEvents="none">
          {children}
        </Box>

        {/* Last in the tree: names sit above the ring, the marks and the comet. */}
        {points.map((point, index) => {
          const stage = stages[index];
          const u = geometry.directions[index];
          if (!stage || !u) return null;
          return (
            <StationLabel
              key={stage.key}
              index={index}
              point={point}
              direction={u}
              width={geometry.width}
              isRTL={isRTL}
              name={t(DEAL_STATION_LABEL[stage.key])}
              status={stage.status}
              current={index === nowIndex && !done}
              selected={index === selected}
              onSelect={onSelect}
            />
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
};

interface StationMarkProps {
  point: Point;
  status: DealJourneyStatus;
  stopped: boolean;
  tone: { arc: string; idle: string; hub: string; now: string };
}

/** One station on the ring (Skia): done = filled, now = a ringed hub, ahead = hollow. */
const StationMark = memo<StationMarkProps>(
  ({ point, status, stopped, tone }) => {
    if (status === 'done')
      return (
        <Circle cx={point.x} cy={point.y} r={NODE_DONE} color={tone.arc} />
      );
    if (status === 'now') {
      return (
        <Group>
          <Circle cx={point.x} cy={point.y} r={NODE_NOW} color={tone.hub} />
          <Circle
            cx={point.x}
            cy={point.y}
            r={NODE_NOW}
            style="stroke"
            strokeWidth={NODE_NOW_STROKE}
            color={tone.now}
          />
          {stopped ? (
            <Group>
              <Line
                p1={vec(point.x - CROSS, point.y - CROSS)}
                p2={vec(point.x + CROSS, point.y + CROSS)}
                color={tone.now}
                strokeWidth={NODE_IDLE_STROKE}
                strokeCap="round"
              />
              <Line
                p1={vec(point.x + CROSS, point.y - CROSS)}
                p2={vec(point.x - CROSS, point.y + CROSS)}
                color={tone.now}
                strokeWidth={NODE_IDLE_STROKE}
                strokeCap="round"
              />
            </Group>
          ) : null}
        </Group>
      );
    }
    return (
      <Circle
        cx={point.x}
        cy={point.y}
        r={NODE_IDLE}
        style="stroke"
        strokeWidth={NODE_IDLE_STROKE}
        color={tone.idle}
      />
    );
  },
);

interface StationLabelProps {
  index: number;
  point: Point;
  /** Outward unit vector of the station. */
  direction: Point;
  width: number;
  isRTL: boolean;
  name: string;
  status: DealJourneyStatus;
  current: boolean;
  selected: boolean;
  onSelect: (index: number) => void;
}

/**
 * A station's name outside the ring, its box held `LABEL_CLEAR` away from the mark on every
 * side; the current station adds «now» on a second line instead of widening the pill. The
 * whole label is the station's tap target.
 */
const StationLabel = memo<StationLabelProps>(
  ({
    index,
    point,
    direction,
    width,
    isRTL,
    name,
    status,
    current,
    selected,
    onSelect,
  }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const press = useCallback(() => {
      Vibration.vibrate(HAPTIC_TAP_MS);
      onSelect(index);
    }, [index, onSelect]);

    const offset = labelOffset(direction);
    const x = point.x + direction.x * offset;
    const y = point.y + direction.y * offset;
    const fromStart = isRTL ? width - x : x;

    const styles = useStyles(
      ({
        radii,
        spacing,
        borderWidths,
        zIndices,
      }): Record<'slot' | 'pill', ViewStyle> => ({
        slot: {
          position: 'absolute',
          top: y - LABEL_HEIGHT / 2,
          start: fromStart - LABEL_WIDTH / 2,
          width: LABEL_WIDTH,
          height: LABEL_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndices.raised,
        },
        pill: {
          width: LABEL_WIDTH,
          alignItems: 'center',
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
          borderRadius: radii.lg,
          backgroundColor: selected
            ? colors.glass.fill
            : colors.layout.transparent,
          borderWidth: selected ? borderWidths.thin : 0,
          borderColor: colors.glass.border,
        },
      }),
      [
        colors.glass.border,
        colors.glass.fill,
        colors.layout.transparent,
        fromStart,
        selected,
        y,
      ],
    );

    const strong = current || selected;
    return (
      <Box style={styles.slot}>
        <Pressable
          onPress={press}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={t('marketplace.journey.station', {
            name,
            status: t(JOURNEY_STATUS_LABEL[status]),
          })}
        >
          <Text
            variant={strong ? 'buttonSmall' : 'caption'}
            color={strong ? colors.text.onBrand : colors.text.onBrandMuted}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {name}
          </Text>
          {current ? (
            <Text variant="overline" color={colors.deal.orbitArc}>
              {t('marketplace.deals.orbit.now')}
            </Text>
          ) : null}
        </Pressable>
      </Box>
    );
  },
);

export const DealOrbit = memo(DealOrbitComponent);
