import React, { memo, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion, moderateScale, opacity, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';

const SEAT = moderateScale(46);
const BEAM_WIDTH = moderateScale(150);
const BEAM_HEIGHT = moderateScale(260);
const BEAM_TOP = moderateScale(-40);
const BEAM_END = moderateScale(40);
const BEAM_TILT = '14deg';
const LIFT_UP = moderateScale(-4);
const LIFT_DOWN = moderateScale(8);
const LIFT_SCALE = 1.12;
const REST_SCALE = 0.9;
/** Empty seats around the brand: a shape for "other brands", never made-up names. */
const SEATS_BEFORE = [0, 1];
const SEATS_AFTER = [2, 3];

interface BrandSpotlightProps {
  visible: boolean;
  brandName: string;
  logoUrl: string | null;
}

/**
 * The visibility switch as a stage: when the brand is shown in creators' media kits a warm beam
 * falls on its tile and the tile steps forward; hidden, it sinks back among the empty seats.
 * Moves only when the switch flips.
 */
const BrandSpotlightComponent: React.FC<BrandSpotlightProps> = ({ visible, brandName, logoUrl }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const lit = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    const target = visible ? 1 : 0;
    lit.value = reduceMotion ? target : withSpring(target, motion.spring);
  }, [lit, reduceMotion, visible]);

  const beam = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    const target = visible ? 1 : 0;
    beam.value = reduceMotion ? target : withTiming(target, { duration: motion.duration.slow });
  }, [beam, reduceMotion, visible]);

  const beamStyle = useAnimatedStyle(() => ({ opacity: beam.value }));
  const meStyle = useAnimatedStyle(() => ({
    opacity: opacity.disabled + (1 - opacity.disabled) * lit.value,
    transform: [
      { translateY: LIFT_DOWN + (LIFT_UP - LIFT_DOWN) * lit.value },
      { scale: REST_SCALE + (LIFT_SCALE - REST_SCALE) * lit.value },
    ],
  }));

  const styles = useStyles(
    ({ radii, shadows }): Record<'beam' | 'seat' | 'me', ViewStyle> => ({
      beam: {
        position: 'absolute',
        top: BEAM_TOP,
        end: BEAM_END,
        width: BEAM_WIDTH,
        height: BEAM_HEIGHT,
        transform: [{ rotate: BEAM_TILT }],
      },
      seat: { width: SEAT, height: SEAT, borderRadius: radii.md, backgroundColor: colors.profile.spotlightSeat },
      me: {
        width: SEAT,
        height: SEAT,
        borderRadius: radii.md,
        overflow: 'hidden',
        backgroundColor: colors.interactive.main,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
      },
    }),
    [colors.interactive.main, colors.profile.spotlightSeat],
  );

  const initial = Array.from(brandName.trim())[0] ?? '';

  return (
    <>
      <Animated.View style={[styles.beam, beamStyle]} pointerEvents="none">
        <LinearGradient
          colors={[colors.profile.spotlightBeam, colors.layout.transparent]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Box row align="flex-end" gap="sm" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {SEATS_BEFORE.map(key => (
          <Box key={key} style={styles.seat} />
        ))}
        <Animated.View style={[styles.me, meStyle]}>
          {logoUrl ? (
            <Image uri={logoUrl} size={SEAT} />
          ) : (
            <Text variant="title" color={colors.text.onAccent}>
              {initial}
            </Text>
          )}
        </Animated.View>
        {SEATS_AFTER.map(key => (
          <Box key={key} style={styles.seat} />
        ))}
      </Box>
    </>
  );
};

export const BrandSpotlight = memo(BrandSpotlightComponent);
