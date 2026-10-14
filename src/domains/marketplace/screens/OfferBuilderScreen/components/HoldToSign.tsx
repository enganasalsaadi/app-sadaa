import React, { memo, useCallback, useState } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PenLine } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Pressable, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** How long the press must last: long enough to be deliberate, short enough not to annoy. */
const HOLD_MS = 1000;
const BUTTON_HEIGHT = moderateScale(56);
const RING = moderateScale(34);
const RING_STROKE = 3;
const RADIUS = (RING - RING_STROKE) / 2;
const LENGTH = 2 * Math.PI * RADIUS;

/**
 * The signature: press and hold until the ring closes and the capsule fills (one second), a light
 * tap of haptics, then the offer is signed and sent. Letting go early drains it and the caption
 * turns into «keep holding».
 */
const HoldToSignComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { onSign, sending, creatorName } = useOfferBuilder();
  const { bottom } = useSafeAreaInsets();
  const [hint, setHint] = useState(false);
  const progress = useSharedValue(0);

  const complete = useCallback(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    setHint(false);
    onSign();
  }, [onSign]);

  const onPressIn = useCallback(() => {
    if (sending) return;
    setHint(false);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, finished => {
      if (finished) scheduleOnRN(complete);
    });
  }, [complete, progress, sending]);

  const onPressOut = useCallback(() => {
    if (progress.value >= 1) {
      progress.value = withTiming(0, { duration: motion.duration.slow });
      return;
    }
    cancelAnimation(progress);
    if (progress.value > 0.05) setHint(true);
    progress.value = withTiming(0, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - progress.value) }));
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.025 * Math.min(1, progress.value * 4) }] }));

  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'wrap' | 'button' | 'fill' | 'ring', ViewStyle> => ({
      // The footer slot already pads by the home-indicator inset; top it up to at least `lg`.
      wrap: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: Math.max(0, spacing.lg - bottom),
        gap: spacing.sm,
      },
      button: { borderRadius: radii.full, overflow: 'hidden', ...shadows.md },
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        backgroundColor: colors.glass.fill,
        // The fill grows from the reading start.
        transformOrigin: isRTL ? 'right' : 'left',
      },
      ring: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
    }),
    [bottom, colors.glass.fill, isRTL],
  );

  return (
    <Box style={styles.wrap}>
      <Box accessibilityLiveRegion="polite">
        <Text
          variant="caption"
          color={hint ? colors.status.warning.text : colors.text.tertiary}
          align="center"
          numberOfLines={2}
        >
          {hint ? t('marketplace.offer.sign.hint') : t('marketplace.offer.sign.caption')}
        </Text>
      </Box>
      <Animated.View style={[styles.button, pressStyle]}>
        <Pressable
          row
          align="center"
          justify="center"
          gap="md"
          height={BUTTON_HEIGHT}
          bg={sending ? colors.status.success.text : colors.button.primary.bg}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={sending}
          accessibilityRole="button"
          accessibilityState={{ busy: sending }}
          accessibilityLabel={t('marketplace.offer.sign.hold')}
          accessibilityHint={t('marketplace.offer.sign.a11yHint')}
          accessibilityActions={[{ name: 'activate' }, { name: 'longpress' }]}
          onAccessibilityAction={complete}
        >
          <Animated.View style={[styles.fill, fillStyle]} pointerEvents="none" />
          {sending ? (
            <>
              <LiveDot color={colors.text.onAccent} />
              <Text variant="button" color={colors.text.onAccent} numberOfLines={1}>
                {t('marketplace.offer.sign.sending', { name: creatorName })}
              </Text>
            </>
          ) : (
            <>
              <Box width={RING} height={RING} align="center" justify="center">
                <Svg width={RING} height={RING} style={styles.ring}>
                  <Circle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={RADIUS}
                    stroke={colors.glass.border}
                    strokeWidth={RING_STROKE}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={RADIUS}
                    stroke={colors.button.primary.text}
                    strokeWidth={RING_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={`${LENGTH} ${LENGTH}`}
                    animatedProps={ringProps}
                    fill="none"
                  />
                </Svg>
                <PenLine size={sizes.icon.sm} color={colors.button.primary.text} />
              </Box>
              <Text variant="button" color={colors.button.primary.text}>
                {t('marketplace.offer.sign.hold')}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </Box>
  );
};

export const HoldToSign = memo(HoldToSignComponent);
