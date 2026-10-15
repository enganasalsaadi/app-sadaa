import React, { memo, useEffect, useMemo } from 'react';
import { useWindowDimensions, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { Money } from '@/core/money';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, MoneyText, Text, useScreenFocused } from '@/shared/ui';
import type { DisputeLean } from '../hooks/useDealDisputeScreen';

const AREA_H = moderateScale(206);
const PIVOT_Y = moderateScale(40);
const POST_W = moderateScale(6);
const PIVOT = moderateScale(18);
const BEAM_H = moderateScale(5);
const BEAM_MAX = moderateScale(300);
const PAN_W = moderateScale(84);
const STRING_H = moderateScale(66);
const BOWL_D = moderateScale(24);
const PAN_H = STRING_H + BOWL_D + moderateScale(2);
const BASE_W = moderateScale(92);
const BASE_H = moderateScale(14);
const AMOUNT_TOP = PIVOT_Y + moderateScale(60);
const LABEL_W = moderateScale(124);
const STROKE = 1.6;
/** Degrees: the idle sway, and the one tip after a ruling. */
const SWAY = 2;
const TILT = 6;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SWAY_EASE = Easing.inOut(Easing.sin);

/** Strings from the hang point to the rim, then the bowl. */
const PAN_PATH = {
  strings: `M${PAN_W / 2} 0 L4 ${STRING_H} M${PAN_W / 2} 0 L${PAN_W - 4} ${STRING_H}`,
  bowl: `M2 ${STRING_H} H${PAN_W - 2} Q${PAN_W - 6} ${STRING_H + BOWL_D} ${PAN_W / 2} ${STRING_H + BOWL_D} Q6 ${
    STRING_H + BOWL_D
  } 2 ${STRING_H} Z`,
};

interface PanColors {
  string: string;
  rim: string;
  fill: string;
}

const Pan = memo<{ colors: PanColors }>(({ colors }) => (
  <Svg width={PAN_W} height={PAN_H}>
    <Path d={PAN_PATH.strings} stroke={colors.string} strokeWidth={STROKE} />
    <Path d={PAN_PATH.bowl} fill={colors.fill} stroke={colors.rim} strokeWidth={STROKE} />
  </Svg>
));

interface Side {
  name: string;
  caption: string;
}

export interface DisputeScalesProps {
  badge: string;
  /** The case is being weighed: a live dot, and the beam sways while the screen is in view. */
  live: boolean;
  amount: Money;
  amountLabel: string;
  mine: Side;
  theirs: Side;
  /** After a ruling: the pan it weighs down tips once (and lights in mint). */
  lean: DisputeLean | null;
}

/**
 * «الميزان» (approved): a pair of scales over the held amount, the viewer's pan at the start and
 * the other party's at the end. While the case is weighed the beam sways slowly (stops off-screen
 * and under reduced motion); a ruling tips it once toward the side it favoured.
 */
const DisputeScalesComponent: React.FC<DisputeScalesProps> = ({ badge, live, amount, amountLabel, mine, theirs, lean }) => {
  const { colors, isRTL } = useTheme();
  const { width } = useWindowDimensions();
  const focused = useScreenFocused();
  const reduced = useReducedMotion();
  const beamW = Math.min(width - PAN_W, BEAM_MAX);
  const labelGutter = Math.max(0, (width - beamW) / 2 - LABEL_W / 2);

  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<
      'badge' | 'area' | 'post' | 'base' | 'pivot' | 'beam' | 'bar' | 'panStart' | 'panEnd' | 'amount' | 'labels' | 'label',
      ViewStyle
    > => ({
      badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      area: { height: AREA_H, width: '100%' },
      post: {
        position: 'absolute',
        top: PIVOT_Y,
        height: AREA_H - PIVOT_Y - BASE_H,
        width: POST_W,
        start: (width - POST_W) / 2,
        borderRadius: radii.full,
        backgroundColor: colors.glass.border,
      },
      base: {
        position: 'absolute',
        bottom: 0,
        start: (width - BASE_W) / 2,
        width: BASE_W,
        height: BASE_H,
        borderRadius: radii.full,
        backgroundColor: colors.glass.fill,
      },
      pivot: {
        position: 'absolute',
        top: PIVOT_Y - PIVOT / 2,
        start: (width - PIVOT) / 2,
        width: PIVOT,
        height: PIVOT,
        borderRadius: radii.full,
        backgroundColor: colors.glass.iconInteractive,
      },
      // Wide and deep enough to hold both pans, so nothing hangs outside its parent (Android clips);
      // it turns around the bar's middle, which sits on the pivot.
      beam: {
        position: 'absolute',
        top: PIVOT_Y - BEAM_H / 2,
        start: (width - beamW - PAN_W) / 2,
        width: beamW + PAN_W,
        height: BEAM_H + PAN_H,
        transformOrigin: ['50%', BEAM_H / 2, 0],
      },
      bar: { height: BEAM_H, marginHorizontal: PAN_W / 2, borderRadius: radii.full, backgroundColor: colors.text.onBrand },
      panStart: { position: 'absolute', top: BEAM_H / 2, start: 0, transformOrigin: 'top' },
      panEnd: { position: 'absolute', top: BEAM_H / 2, end: 0, transformOrigin: 'top' },
      amount: { position: 'absolute', top: AMOUNT_TOP, start: 0, end: 0, alignItems: 'center', gap: spacing.xs },
      labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: labelGutter },
      label: { width: LABEL_W, alignItems: 'center', gap: spacing.xs },
    }),
    [beamW, colors.glass.border, colors.glass.fill, colors.glass.iconInteractive, colors.text.onBrand, labelGutter, width],
  );
  const text = useStyles((): Record<'center', TextStyle> => ({ center: { textAlign: 'center' } }), []);

  const angle = useSharedValue(0);
  // Clockwise lowers the right end: the start pan is on the right in RTL.
  const lowerStart = isRTL ? TILT : -TILT;
  const tilt = lean === 'mine' ? lowerStart : lean === 'theirs' ? -lowerStart : 0;
  useEffect(() => {
    if (lean !== null) {
      angle.value = reduced
        ? tilt
        : withDelay(motion.duration.slow, withTiming(tilt, { duration: motion.duration.tilt, easing: EASE_OUT }));
      return;
    }
    if (!live || !focused || reduced) {
      angle.value = withTiming(0, { duration: motion.duration.base });
      return;
    }
    const leg = motion.loop.scalesSway;
    angle.value = withSequence(
      withTiming(-SWAY, { duration: leg / 2, easing: SWAY_EASE }),
      withRepeat(withTiming(SWAY, { duration: leg, easing: SWAY_EASE }), -1, true),
    );
    return () => cancelAnimation(angle);
  }, [angle, focused, lean, live, reduced, tilt]);

  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  // Pans hang plumb whatever the beam does.
  const panStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-angle.value}deg` }] }));

  const pans = useMemo(() => {
    const idle: PanColors = { string: colors.text.onBrandMuted, rim: colors.text.onBrandMuted, fill: colors.glass.fill };
    const heavy: PanColors = { ...idle, rim: colors.glass.iconMoney, fill: colors.glass.badge };
    return { mine: lean === 'mine' ? heavy : idle, theirs: lean === 'theirs' ? heavy : idle };
  }, [colors.glass.badge, colors.glass.fill, colors.glass.iconMoney, colors.text.onBrandMuted, lean]);

  return (
    <Box pt="md" pb="4xl" gap="sm">
      <Box style={styles.badge} accessible accessibilityRole="text">
        {live ? <LiveDot color={colors.glass.iconWarning} /> : null}
        <Text variant="label" color={colors.text.onBrand}>
          {badge}
        </Text>
      </Box>
      <Box style={styles.area} accessible={false} importantForAccessibility="no-hide-descendants">
        <Box style={styles.post} />
        <Box style={styles.base} />
        <Animated.View style={[styles.beam, beamStyle]}>
          <Box style={styles.bar} />
          <Animated.View style={[styles.panStart, panStyle]}>
            <Pan colors={pans.mine} />
          </Animated.View>
          <Animated.View style={[styles.panEnd, panStyle]}>
            <Pan colors={pans.theirs} />
          </Animated.View>
        </Animated.View>
        <Box style={styles.pivot} />
        <Box style={styles.amount}>
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {amountLabel}
          </Text>
          <MoneyText value={amount} size="lg" tone="onBrand" animated />
        </Box>
      </Box>
      <Box style={styles.labels}>
        {[mine, theirs].map((side, index) => (
          <Box key={index === 0 ? 'mine' : 'theirs'} style={styles.label}>
            <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={1} style={text.center}>
              {side.name}
            </Text>
            <Text variant="caption" color={colors.text.onBrandMuted} style={text.center}>
              {side.caption}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const DisputeScales = memo(DisputeScalesComponent);
