import React, { memo, useCallback, useEffect } from 'react';
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
import { Mail } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Chip, Text, useScreenFocused } from '@/shared/ui';

const MARK = moderateScale(64);
const RING_OUTSET = moderateScale(6);
/** One slow breath in and out: waiting, not alarming. */
const BREATH_MS = 3200;
const BREATH_SCALE = 0.16;
const BREATH_FADE = 0.75;
const MESSAGE_MAX = moderateScale(290);

const SHORTCUT = { rates: 'rates', platforms: 'platforms' } as const;

interface DealsWelcomeProps {
  onSetRates: () => void;
  onLinkPlatforms: () => void;
}

/**
 * Before the first offer ever: an envelope on its way, one line on what will appear here, and the
 * two things that make a brand find the creator (prices, linked accounts). The ring rests while
 * the screen is blurred and under reduced motion.
 */
const DealsWelcomeComponent: React.FC<DealsWelcomeProps> = ({ onSetRates, onLinkPlatforms }) => {
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
    ({ colors: palette, borderWidths }): Record<'ring' | 'message', ViewStyle> => ({
      ring: {
        ...StyleSheet.absoluteFill,
        margin: -RING_OUTSET,
        borderRadius: MARK,
        borderWidth: borderWidths.md,
        borderColor: palette.interactive.soft,
      },
      message: { maxWidth: MESSAGE_MAX },
    }),
    [],
  );
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - breath.value * BREATH_FADE,
    transform: [{ scale: 1 + breath.value * BREATH_SCALE }],
  }));

  const onShortcut = useCallback(
    (value: string) => (value === SHORTCUT.rates ? onSetRates() : onLinkPlatforms()),
    [onLinkPlatforms, onSetRates],
  );

  return (
    <Box
      mx="xl"
      px="lg"
      py="2xl"
      borderRadius="xl"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      align="center"
      gap="xs"
    >
      <Box
        width={MARK}
        height={MARK}
        borderRadius="full"
        bg={colors.interactive.soft}
        align="center"
        justify="center"
        mb="md"
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
        <Mail size={sizes.icon.lg} color={colors.interactive.text} strokeWidth={iconStroke.bold} />
      </Box>
      <Text variant="h4" align="center" accessibilityRole="header">
        {t('marketplace.creatorHome.deals.welcome.title')}
      </Text>
      <Box style={styles.message}>
        <Text variant="bodySmall" align="center" color={colors.text.tertiary}>
          {t('marketplace.creatorHome.deals.welcome.message')}
        </Text>
      </Box>
      <Box row wrap gap="sm" justify="center" mt="lg">
        <Chip
          variant="tile"
          value={SHORTCUT.rates}
          label={t('marketplace.creatorHome.deals.welcome.setRates')}
          onSelect={onShortcut}
        />
        <Chip
          variant="tile"
          value={SHORTCUT.platforms}
          label={t('marketplace.creatorHome.deals.welcome.linkPlatforms')}
          onSelect={onShortcut}
        />
      </Box>
    </Box>
  );
};

export const DealsWelcome = memo(DealsWelcomeComponent);
