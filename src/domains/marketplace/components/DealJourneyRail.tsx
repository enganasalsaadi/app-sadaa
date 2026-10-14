import React, { memo, useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  Check,
  Eye,
  Link2,
  MessageCircle,
  Package,
  PenLine,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { motion, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealJourneyStage, DealJourneyStageKey, DealJourneyStatus } from '../utils/dealJourney';

const STATION = moderateScale(32);
const INSET = STATION / 2 + 1;
const RAIL_HEIGHT = moderateScale(104);
const TRACK_TOP = moderateScale(50);
const STATION_TOP = TRACK_TOP + 2 - STATION / 2;
const PILL_TOP = moderateScale(80);
const TRACK = 4;
const COMET = 12;
const LIFT = 4;
const SELECTED_SCALE = 1.16;
const BREATH_SCALE = 0.08;
const BOB = 3;

export const JOURNEY_ICON = {
  sign: PenLine,
  reply: MessageCircle,
  escrow: ShieldCheck,
  ship: Package,
  make: Sparkles,
  review: Eye,
  publish: Link2,
  done: BadgeCheck,
} as const satisfies Record<DealJourneyStageKey, LucideIcon>;

export const JOURNEY_STATUS_LABEL = {
  done: 'marketplace.journey.status.done',
  now: 'marketplace.journey.status.now',
  next: 'marketplace.journey.status.next',
  later: 'marketplace.journey.status.later',
} as const satisfies Record<DealJourneyStatus, string>;

interface StationProps {
  stage: DealJourneyStage;
  index: number;
  count: number;
  x: number;
  name: string;
  selected: boolean;
  intro: SharedValue<number>;
  clock: SharedValue<number>;
  onSelect: (index: number) => void;
}

/** One station on the rail: pops in on the intro, the current one pulses, the next one breathes. */
const Station = memo<StationProps>(({ stage, index, count, x, name, selected, intro, clock, onSelect }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { status } = stage;
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'node' | 'ring', ViewStyle> => ({
      node: {
        position: 'absolute',
        top: STATION_TOP,
        start: x - STATION / 2,
        width: STATION,
        height: STATION,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          status === 'done'
            ? colors.interactive.main
            : status === 'now'
              ? colors.button.primary.bg
              : status === 'next'
                ? colors.surface.main
                : colors.surface.elevated,
        borderWidth: status === 'next' ? borderWidths.sm : 0,
        borderColor: colors.interactive.main,
      },
      ring: {
        position: 'absolute',
        top: -LIFT - 1,
        bottom: -LIFT - 1,
        start: -LIFT - 1,
        end: -LIFT - 1,
        borderRadius: radii.md + LIFT,
        borderWidth: borderWidths.md,
        borderColor: status === 'now' && !selected ? colors.button.primary.bg : colors.interactive.main,
      },
    }),
    [colors, selected, status, x],
  );

  // Stations pop in one after another while the fill draws.
  const start = (index / Math.max(count, 1)) * 0.6;
  // 0 → 1 as the station becomes the selected one (lifted, larger, ringed).
  const pick = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    pick.value = withSpring(selected ? 1 : 0, motion.spring);
  }, [pick, selected]);
  const nodeStyle = useAnimatedStyle(() => {
    const shown = interpolate(intro.value, [start, start + 0.3], [0, 1], 'clamp');
    const breath = status === 'next' && !selected ? 1 + BREATH_SCALE * Math.sin(clock.value * Math.PI * 2) ** 2 : 1;
    return {
      opacity: shown,
      transform: [
        { translateY: -LIFT * pick.value },
        { scale: interpolate(shown, [0, 1], [0.3, 1]) * breath * (1 + (SELECTED_SCALE - 1) * pick.value) },
      ],
    };
  }, [selected, start, status]);
  const ringStyle = useAnimatedStyle(() => {
    if (selected) return { opacity: 1, transform: [{ scale: 1 }] };
    if (status !== 'now') return { opacity: 0 };
    return { opacity: 0.7 * (1 - clock.value), transform: [{ scale: 0.9 + 0.55 * clock.value }] };
  }, [selected, status]);

  const Icon = status === 'done' ? Check : JOURNEY_ICON[stage.key];
  const iconColor =
    status === 'done'
      ? colors.text.onAccent
      : status === 'now'
        ? colors.button.primary.text
        : status === 'next'
          ? colors.interactive.text
          : colors.text.tertiary;

  return (
    <Animated.View style={[styles.node, nodeStyle]}>
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <Pressable
        width={STATION}
        height={STATION}
        align="center"
        justify="center"
        hitSlop={sizes.hitSlop.sm}
        onPress={() => onSelect(index)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={t('marketplace.journey.station', { name, status: t(JOURNEY_STATUS_LABEL[status]) })}
      >
        <Icon size={sizes.icon.xs} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
});

interface DealJourneyRailProps {
  stages: readonly DealJourneyStage[];
  names: Record<DealJourneyStageKey, string>;
  selected: number;
  onSelect: (index: number) => void;
  /** 0 → 1 once the rail is on screen: the fill draws, stations pop in, the flag drops. */
  intro: SharedValue<number>;
  /** Shared loop (comet, breath, pulse, flag bob); frozen off-screen and under reduced motion. */
  clock: SharedValue<number>;
  moving: boolean;
}

/**
 * The stations in a row: a teal fill drawn up to «now», a dashed leg to the next station with
 * a comet running along it, a «now» flag, and a pill naming the selected station.
 */
const DealJourneyRailComponent: React.FC<DealJourneyRailProps> = ({
  stages,
  names,
  selected,
  onSelect,
  intro,
  clock,
  moving,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const [width, setWidth] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width), []);
  const onPillLayout = useCallback((event: LayoutChangeEvent) => setPillWidth(event.nativeEvent.layout.width), []);

  const count = stages.length;
  const now = Math.max(0, stages.findIndex(stage => stage.status === 'now'));
  const hasNext = now < count - 1;
  const span = Math.max(0, width - INSET * 2);
  const share = (index: number) => (count < 2 ? 0 : index / (count - 1));
  const xOf = (index: number) => INSET + span * share(index);
  const nowX = xOf(now);
  const nextX = xOf(Math.min(now + 1, count - 1));
  // Transforms don't mirror in RTL; positions measured from the start edge do.
  const dir = isRTL ? -1 : 1;

  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'rail' | 'track' | 'fill' | 'leg' | 'comet' | 'flag' | 'pill' | 'dot', ViewStyle> => ({
      rail: { height: RAIL_HEIGHT, marginTop: spacing.xs },
      track: {
        position: 'absolute',
        top: TRACK_TOP,
        start: INSET,
        end: INSET,
        height: TRACK,
        borderRadius: radii.xs,
        backgroundColor: colors.surface.elevated,
      },
      fill: {
        position: 'absolute',
        top: TRACK_TOP,
        start: INSET,
        height: TRACK,
        borderRadius: radii.xs,
        backgroundColor: colors.interactive.main,
      },
      leg: {
        position: 'absolute',
        top: TRACK_TOP + 1,
        start: nowX,
        width: Math.max(0, nextX - nowX),
        borderTopWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.interactive.main,
        opacity: 0.55,
      },
      comet: {
        position: 'absolute',
        top: TRACK_TOP + TRACK / 2 - COMET / 2,
        start: -COMET / 2,
        width: COMET,
        height: COMET,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.main,
        borderWidth: borderWidths.lg,
        borderColor: colors.interactive.soft,
      },
      flag: {
        position: 'absolute',
        top: spacing.xs / 2,
        start: 0,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.full,
        backgroundColor: colors.button.primary.bg,
      },
      pill: {
        position: 'absolute',
        top: PILL_TOP,
        start: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.full,
        backgroundColor: colors.text.primary,
      },
      dot: { width: TRACK, height: TRACK, borderRadius: radii.full, backgroundColor: colors.layout.base },
    }),
    [colors, nextX, nowX],
  );

  const fillStyle = useAnimatedStyle(
    () => ({ width: (nowX - INSET) * Easing.out(Easing.cubic)(intro.value) }),
    [nowX],
  );
  const cometStyle = useAnimatedStyle(() => {
    const p = clock.value;
    const travel = Easing.bezierFn(0.5, 0, 0.3, 1)(p);
    return {
      opacity: moving ? interpolate(p, [0, 0.18, 0.8, 1], [0, 1, 1, 0]) * intro.value : 0,
      transform: [
        { translateX: dir * (nowX + (nextX - nowX) * travel) },
        { scale: interpolate(p, [0, 0.18, 0.8, 1], [0.4, 1, 1, 0.4]) },
      ],
    };
  }, [dir, moving, nextX, nowX]);
  const flagWidth = useSharedValue(0);
  const flagStyle = useAnimatedStyle(() => {
    const drop = interpolate(intro.value, [0.6, 1], [-14, 0], 'clamp');
    const bob = moving ? -BOB * Math.sin(clock.value * Math.PI * 2) ** 2 : 0;
    return {
      opacity: interpolate(intro.value, [0.6, 1], [0, 1], 'clamp'),
      transform: [{ translateX: dir * nowX }, { translateX: (-dir * flagWidth.value) / 2 }, { translateY: drop + bob }],
    };
  }, [dir, moving, nowX]);
  const onFlagLayout = useCallback(
    (event: LayoutChangeEvent) => {
      flagWidth.value = event.nativeEvent.layout.width;
    },
    [flagWidth],
  );
  // The pill slides under the selected station and leans inward at both ends to stay on the card.
  const pillStart = dir * (xOf(selected) - share(selected) * pillWidth);
  const pillX = useSharedValue(pillStart);
  useEffect(() => {
    pillX.value = withSpring(pillStart, motion.spring);
  }, [pillStart, pillX]);
  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(intro.value, [0.7, 1], [0, 1], 'clamp'),
    transform: [{ translateX: pillX.value }],
  }));

  const pick = stages[selected];

  return (
    <Box style={styles.rail} onLayout={onLayout}>
      {width > 0 ? (
        <>
          <Box style={styles.track} />
          <Animated.View style={[styles.fill, fillStyle]} />
          {hasNext ? <Box style={styles.leg} /> : null}
          {hasNext ? <Animated.View style={[styles.comet, cometStyle]} pointerEvents="none" /> : null}
          {stages.map((stage, index) => (
            <Station
              key={stage.key}
              stage={stage}
              index={index}
              count={count}
              x={xOf(index)}
              name={names[stage.key]}
              selected={index === selected}
              intro={intro}
              clock={clock}
              onSelect={onSelect}
            />
          ))}
          <Animated.View style={[styles.flag, flagStyle]} onLayout={onFlagLayout} pointerEvents="none">
            <Text variant="overline" color={colors.button.primary.text}>
              {t('marketplace.journey.flag')}
            </Text>
          </Animated.View>
          {pick ? (
            <Animated.View style={[styles.pill, pillStyle]} onLayout={onPillLayout} pointerEvents="none">
              <Text variant="caption" color={colors.layout.base}>
                {names[pick.key]}
              </Text>
              <Box style={styles.dot} />
              <Text variant="caption" color={colors.layout.base}>
                {t(JOURNEY_STATUS_LABEL[pick.status])}
              </Text>
            </Animated.View>
          ) : null}
        </>
      ) : null}
    </Box>
  );
};

export const DealJourneyRail = memo(DealJourneyRailComponent);
