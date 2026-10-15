import React, { memo, useEffect } from 'react';
import { StyleSheet, Vibration, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/** How far the seal comes from: bigger and turned, then pressed flat. */
const STAMP_FROM_SCALE = 1.8;
const STAMP_FROM_TURN = -12;
/** A heavier buzz than a tap: the seal landing. */
const SEAL_HAPTIC_MS = 28;
const RIM_DASH = '3 4';

export interface DealRatingWaxProps {
  size: number;
  /** The average pressed into it; a check when the score is not known here. */
  value: number | null;
  /** Lands with a press (once, on mount) and a buzz; still under reduced motion. */
  stamp?: boolean;
}

/** The wax seal on a sealed rating: a teal-to-navy disc, a dashed inner ring, the average in it. */
const DealRatingWaxComponent: React.FC<DealRatingWaxProps> = ({
  size,
  value,
  stamp = false,
}) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const animate = stamp && !reduceMotion;
  const landed = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    landed.value = withSpring(1, motion.stampSpring);
    const buzz = setTimeout(
      () => Vibration.vibrate(SEAL_HAPTIC_MS),
      motion.duration.fast,
    );
    return () => clearTimeout(buzz);
  }, [animate, landed]);

  const pressStyle = useAnimatedStyle(() => ({
    opacity: interpolate(landed.value, [0, 0.35], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(landed.value, [0, 1], [STAMP_FROM_SCALE, 1]) },
      {
        rotate: `${interpolate(landed.value, [0, 1], [STAMP_FROM_TURN, 0])}deg`,
      },
    ],
  }));

  const styles = useStyles(
    ({ shadows }): Record<'disc', ViewStyle> => ({
      disc: {
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
      },
    }),
    [size],
  );

  const r = size / 2;
  const [core, mid, rim] = colors.rating.wax;
  return (
    <Animated.View style={[styles.disc, pressStyle]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="ratingWax" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor={core} />
            <Stop offset="0.55" stopColor={mid} />
            <Stop offset="1" stopColor={rim} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill="url(#ratingWax)" />
        <Circle
          cx={r}
          cy={r}
          r={r * 0.78}
          fill="none"
          stroke={colors.rating.waxRim}
          strokeWidth={1.5}
          strokeDasharray={RIM_DASH}
        />
      </Svg>
      {value === null ? (
        <Check size={sizes.icon.md} color={colors.text.onBrand} />
      ) : (
        <Box>
          <Text
            variant={size > sizes.icon.md * 3 ? 'h3' : 'title'}
            color={colors.text.onBrand}
          >
            {formatNumber(value, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </Text>
        </Box>
      )}
    </Animated.View>
  );
};

export const DealRatingWax = memo(DealRatingWaxComponent);
