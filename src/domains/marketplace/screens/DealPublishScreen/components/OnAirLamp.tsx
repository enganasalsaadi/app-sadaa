import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Vibration, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const BULB = moderateScale(12);
const HALO_REST = 0.18;
const HALO_PEAK = 0.4;
const HALO_SCALE = 1.12;

export interface OnAirLampProps {
  /** Lit once the link looks right and a screenshot is in: ready to hand in. */
  on: boolean;
}

/**
 * «ON AIR» (approved P7 «على الهواء»): a studio lamp that stays dark until the post is ready to
 * hand in, then lights teal with a tap and hums (a slow halo breath, one of the "live now" loops,
 * resting while the screen is blurred or under reduced motion).
 */
const OnAirLampComponent: React.FC<OnAirLampProps> = ({ on }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const lit = useSharedValue(on ? 1 : 0);
  const hum = useSharedValue(0);
  const wasOn = useRef(on);

  useEffect(() => {
    lit.value = reduceMotion ? (on ? 1 : 0) : withTiming(on ? 1 : 0, { duration: motion.duration.slow });
    if (on && !wasOn.current) Vibration.vibrate(HAPTIC_TAP_MS);
    wasOn.current = on;
  }, [lit, on, reduceMotion]);

  useEffect(() => {
    if (!on || reduceMotion || !focused) {
      hum.value = 0;
      return;
    }
    hum.value = withRepeat(
      withTiming(1, { duration: motion.loop.statusPulse, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(hum);
  }, [focused, hum, on, reduceMotion]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: lit.value * (HALO_REST + (HALO_PEAK - HALO_REST) * hum.value),
    transform: [{ scale: 1 + (HALO_SCALE - 1) * hum.value }],
  }));

  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'wrap' | 'lamp' | 'halo' | 'bulb', ViewStyle> => ({
      // Hugs the lamp so the halo breathes around it, not across the hero.
      wrap: { alignSelf: 'center' },
      lamp: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radii.md,
        borderWidth: borderWidths.md,
        borderColor: on ? colors.live.lampOn : colors.live.lampOffBorder,
        backgroundColor: on ? colors.live.lampOnFill : colors.live.lampOffFill,
      },
      halo: {
        ...StyleSheet.absoluteFill,
        borderRadius: radii.lg,
        backgroundColor: colors.live.lampOn,
      },
      bulb: {
        width: BULB,
        height: BULB,
        borderRadius: radii.full,
        backgroundColor: on ? colors.live.lampOn : colors.live.lampOffBorder,
      },
    }),
    [colors.live, on],
  );

  return (
    <Box
      style={styles.wrap}
      accessible
      accessibilityRole="text"
      accessibilityLabel={on ? t('marketplace.deals.publish.creator.lampOn') : t('marketplace.deals.publish.creator.lampOff')}
    >
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none" />
      <Box style={styles.lamp}>
        <Box style={styles.bulb} />
        <Text variant="title" color={on ? colors.text.onBrand : colors.live.lampOff}>
          {t('marketplace.deals.publish.creator.lamp')}
        </Text>
      </Box>
    </Box>
  );
};

export const OnAirLamp = memo(OnAirLampComponent);
