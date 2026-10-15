import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';

const TILT = -9;
/** The stamp starts this much bigger, as if lifted off the page, then lands. */
const LIFT = 1.6;

export interface DealShippingStampProps {
  label: string;
  tone: 'success' | 'warning';
}

/**
 * A rubber stamp pressed onto the waybill (approved 2026-10-15, direction A): green «received»,
 * amber with the reported problem. It lands once with the stamp spring; still under reduced motion.
 */
const DealShippingStampComponent: React.FC<DealShippingStampProps> = ({ label, tone }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    press.value = withSpring(1, motion.stampSpring);
  }, [press, reduceMotion]);
  const pressed = useAnimatedStyle(() => ({
    opacity: Math.min(1, press.value * 2),
    transform: [{ rotate: `${TILT}deg` }, { scale: LIFT - (LIFT - 1) * press.value }],
  }));
  const ink = colors.status[tone].text;
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'stamp', ViewStyle> => ({
      stamp: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        borderWidth: borderWidths.lg,
        borderColor: ink,
        backgroundColor: colors.status[tone].soft,
      },
    }),
    [colors.status, ink, tone],
  );
  return (
    <Animated.View style={[styles.stamp, pressed]}>
      <Text variant="buttonSmall" color={ink} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
};

export const DealShippingStamp = memo(DealShippingStampComponent);
