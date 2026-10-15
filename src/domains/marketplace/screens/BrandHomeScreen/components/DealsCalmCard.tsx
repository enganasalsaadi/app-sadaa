import React, { memo, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text, useScreenFocused } from '@/shared/ui';

const MARK = moderateScale(52);
const RING_OUTSET = moderateScale(5);
/** One slow breath in and out: calm, not a status pulse. */
const BREATH_MS = 3200;
const BREATH_SCALE = 0.12;
const BREATH_FADE = 0.7;

/**
 * Inbox zero: a short calm card (mint tick, breathing ring) so the tracker below takes the eye.
 * The ring rests while the screen is blurred and under reduced motion.
 */
const DealsCalmCardComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const focused = useScreenFocused();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !focused) return undefined;
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [breath, focused, reduceMotion]);

  const styles = useStyles(
    ({ colors: palette, borderWidths }): Record<'ring', ViewStyle> => ({
      ring: {
        ...StyleSheet.absoluteFill,
        margin: -RING_OUTSET,
        borderRadius: MARK,
        borderWidth: borderWidths.md,
        borderColor: palette.money.soft,
      },
    }),
    [],
  );
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - breath.value * BREATH_FADE,
    transform: [{ scale: 1 + breath.value * BREATH_SCALE }],
  }));
  const title = t('marketplace.brandHome.deals.calm.title');
  const message = t('marketplace.brandHome.deals.calm.message');

  return (
    <Box
      row
      align="center"
      gap="lg"
      mx="xl"
      p="lg"
      borderRadius="lg"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      accessible
      accessibilityLabel={`${title}. ${message}`}
    >
      <Box
        width={MARK}
        height={MARK}
        borderRadius="full"
        bg={colors.money.soft}
        align="center"
        justify="center"
      >
        <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
        <Check size={sizes.icon.md} color={colors.money.text} strokeWidth={iconStroke.bold} />
      </Box>
      <Box flex={1}>
        <Text variant="title" numberOfLines={2}>
          {title}
        </Text>
        <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={2}>
          {message}
        </Text>
      </Box>
    </Box>
  );
};

export const DealsCalmCard = memo(DealsCalmCardComponent);
