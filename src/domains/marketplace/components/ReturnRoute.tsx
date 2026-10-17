import React, { memo, useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Check, LockOpen, Package, Store, User, type LucideIcon } from 'lucide-react-native';
import { iconStroke, moderateScale, motion, resolveHue, useStyles, useTheme, type HueTone } from '@/core/theme';
import { Box, Text, useScreenFocused } from '@/shared/ui';

const NODE = moderateScale(34);
const PARCEL = moderateScale(30);
const TRACK = moderateScale(36);
const LINE = moderateScale(3);
/** The parcel on its way runs between these two shares of the route, fading in and out at the ends. */
const TRAVEL_FROM = 0.1;
const TRAVEL_TO = 0.9;
const FADE_EDGE = 0.12;

export type ReturnRouteMode = 'waiting' | 'moving' | 'arrived' | 'kept' | 'problem';

const MODE_ICON = {
  waiting: Package,
  moving: Package,
  arrived: Check,
  kept: LockOpen,
  problem: Package,
} as const satisfies Record<ReturnRouteMode, LucideIcon>;

export interface ReturnRouteProps {
  mode: ReturnRouteMode;
  tone: HueTone;
  /** Where the parcel rests, 0 (with the creator) to 1 (arrived). */
  progress: number;
  /** Under the creator end, e.g. «You». */
  fromLabel: string;
  /** Under the brand end. */
  toLabel: string;
}

/**
 * The sample's road back (PC9.0): the creator at one end, the brand at the other and the parcel on
 * the line between. It breathes while it still waits on the creator, travels while it's on its way,
 * lands with the line filled when the brand has it, and stays put with an open lock when the brand
 * let it go. Decorative: the card's title and lines say the same in words. Loops stop off-screen and
 * under reduced motion.
 */
const ReturnRouteComponent: React.FC<ReturnRouteProps> = ({ mode, tone, progress, fromLabel, toLabel }) => {
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const focused = useScreenFocused();
  const hue = resolveHue(colors, tone);
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width), []);

  const at = useSharedValue(progress);
  const trip = useSharedValue(0);
  const ring = useSharedValue(0);
  const moving = mode === 'moving';
  const waiting = mode === 'waiting';

  useEffect(() => {
    at.value = reduceMotion ? progress : withTiming(progress, { duration: motion.duration.slow });
  }, [at, progress, reduceMotion]);

  useEffect(() => {
    if (!moving || reduceMotion || !focused) return undefined;
    trip.value = 0;
    trip.value = withRepeat(withTiming(1, { duration: motion.loop.parcelTravel, easing: Easing.linear }), -1, false);
    return () => {
      cancelAnimation(trip);
      trip.value = 0;
    };
  }, [focused, moving, reduceMotion, trip]);

  useEffect(() => {
    if (!waiting || reduceMotion || !focused) return undefined;
    ring.value = 0;
    ring.value = withRepeat(withTiming(1, { duration: motion.loop.parcelPulse, easing: Easing.out(Easing.quad) }), -1, false);
    return () => {
      cancelAnimation(ring);
      ring.value = 0;
    };
  }, [focused, reduceMotion, ring, waiting]);

  const room = Math.max(0, width - PARCEL);
  const direction = isRTL ? -1 : 1;
  const parcelStyle = useAnimatedStyle(() => {
    const share = moving && !reduceMotion ? TRAVEL_FROM + trip.value * (TRAVEL_TO - TRAVEL_FROM) : at.value;
    const fade = moving && !reduceMotion
      ? interpolate(trip.value, [0, FADE_EDGE, 1 - FADE_EDGE, 1], [0, 1, 1, 0])
      : 1;
    return { opacity: fade, transform: [{ translateX: direction * share * room }] };
  });
  const fillStyle = useAnimatedStyle(() => ({ width: at.value * width }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.9]) }],
  }));

  const styles = useStyles(
    ({ radii }): Record<'node' | 'track' | 'line' | 'fill' | 'parcel' | 'ring', ViewStyle> => ({
      node: {
        width: NODE,
        height: NODE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
      },
      track: { flex: 1, height: TRACK, justifyContent: 'center' },
      line: {
        height: LINE,
        borderRadius: radii.full,
        backgroundColor: colors.border.default,
        overflow: 'hidden',
      },
      fill: { height: LINE, backgroundColor: hue.main },
      parcel: {
        position: 'absolute',
        start: 0,
        top: (TRACK - PARCEL) / 2,
        width: PARCEL,
        height: PARCEL,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hue.main,
      },
      ring: {
        position: 'absolute',
        start: 0,
        top: (TRACK - PARCEL) / 2,
        width: PARCEL,
        height: PARCEL,
        borderRadius: radii.full,
        backgroundColor: hue.main,
      },
    }),
    [colors.border.default, colors.surface.main, hue.main],
  );

  const Icon = MODE_ICON[mode];
  return (
    <Box gap="xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box row align="center">
        <Box style={styles.node}>
          <User size={sizes.icon.sm} color={colors.text.secondary} strokeWidth={iconStroke.bold} />
        </Box>
        <Box style={styles.track} onLayout={onLayout}>
          <Box style={styles.line}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </Box>
          {waiting ? <Animated.View style={[styles.ring, ringStyle]} /> : null}
          <Animated.View style={[styles.parcel, parcelStyle]}>
            <Icon size={sizes.icon.xs} color={colors.text.onBrand} strokeWidth={iconStroke.bold} />
          </Animated.View>
        </Box>
        <Box style={styles.node}>
          <Store size={sizes.icon.sm} color={mode === 'arrived' ? hue.main : colors.text.secondary} strokeWidth={iconStroke.bold} />
        </Box>
      </Box>
      <Box row justify="space-between">
        <Text variant="caption" color={colors.text.tertiary}>
          {fromLabel}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {toLabel}
        </Text>
      </Box>
    </Box>
  );
};

export const ReturnRoute = memo(ReturnRouteComponent);
