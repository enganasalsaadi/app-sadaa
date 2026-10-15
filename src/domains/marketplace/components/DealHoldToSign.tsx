import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import { PenLine } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Pressable, Text } from '@/shared/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** How long the press must last: long enough to be deliberate, short enough not to annoy. */
const HOLD_MS = 1000;
const BUTTON_HEIGHT = moderateScale(56);
const RING = moderateScale(34);
const RING_STROKE = 3;
const RADIUS = (RING - RING_STROKE) / 2;
const LENGTH = 2 * Math.PI * RADIUS;
/** Let go before this share and it was a tap, not an attempt: no «keep holding». */
const ATTEMPT_AT = 0.05;
const ACTIONS = [{ name: 'activate' }, { name: 'longpress' }] as const;

export interface DealHoldToSignProps {
  /** On the button: «اضغط مطوّلاً للتوقيع». */
  label: string;
  /** Over the button at rest: what the signature binds. */
  caption: string;
  /** Replaces the caption after an early release: «استمر بالضغط…». */
  hint: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  /**
   * Runs the signature. A promise keeps the button busy until it settles; anything but `true`
   * (invalid form, failed call) frees it again.
   */
  onComplete: () => Promise<boolean | void> | void;
  /** Busy from outside (the call is the parent's). */
  sending?: boolean;
  /** On the button while busy; the label otherwise. */
  sendingLabel?: string;
}

/**
 * Hold to sign (approved 2026-10-15, replaces slide-to-sign): press and hold until the ring closes
 * and the capsule fills (one second), a light haptic, then the signature goes out. Letting go
 * early drains it and the caption turns into «keep holding». Screen readers sign with one action.
 */
const DealHoldToSignComponent: React.FC<DealHoldToSignProps> = ({
  label,
  caption,
  hint,
  accessibilityLabel,
  accessibilityHint,
  onComplete,
  sending = false,
  sendingLabel,
}) => {
  const { colors, sizes, isRTL } = useTheme();
  const [early, setEarly] = useState(false);
  const [running, setRunning] = useState(false);
  const busy = sending || running;
  const progress = useSharedValue(0);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const complete = useCallback(async () => {
    if (busy) return;
    Vibration.vibrate(HAPTIC_TAP_MS);
    setEarly(false);
    const result = onComplete();
    if (!result) return;
    setRunning(true);
    const ok = await result;
    if (ok !== true && mounted.current) setRunning(false);
  }, [busy, onComplete]);

  const onPressIn = useCallback(() => {
    if (busy) return;
    setEarly(false);
    progress.value = withTiming(
      1,
      { duration: HOLD_MS, easing: Easing.linear },
      finished => {
        if (finished) scheduleOnRN(complete);
      },
    );
  }, [busy, complete, progress]);

  const onPressOut = useCallback(() => {
    if (progress.value >= 1) {
      progress.value = withTiming(0, { duration: motion.duration.slow });
      return;
    }
    cancelAnimation(progress);
    if (progress.value > ATTEMPT_AT) setEarly(true);
    progress.value = withTiming(0, {
      duration: motion.duration.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: LENGTH * (1 - progress.value),
  }));
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.025 * Math.min(1, progress.value * 4) }],
  }));

  const styles = useStyles(
    ({
      radii,
      shadows,
    }): Record<'button' | 'fill' | 'ring', ViewStyle> => ({
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
    [colors.glass.fill, isRTL],
  );

  return (
    <Box gap="sm">
      <Box accessibilityLiveRegion="polite">
        <Text
          variant="caption"
          color={early ? colors.status.warning.text : colors.text.tertiary}
          align="center"
          numberOfLines={2}
        >
          {early ? hint : caption}
        </Text>
      </Box>
      <Animated.View style={[styles.button, pressStyle]}>
        <Pressable
          row
          align="center"
          justify="center"
          gap="md"
          height={BUTTON_HEIGHT}
          px="lg"
          bg={busy ? colors.status.success.text : colors.button.primary.bg}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ busy }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityActions={ACTIONS}
          onAccessibilityAction={complete}
        >
          <Animated.View
            style={[styles.fill, fillStyle]}
            pointerEvents="none"
          />
          {busy ? (
            <>
              <LiveDot color={colors.text.onAccent} />
              <Text
                variant="button"
                color={colors.text.onAccent}
                numberOfLines={1}
              >
                {sendingLabel ?? label}
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
                <PenLine
                  size={sizes.icon.sm}
                  color={colors.button.primary.text}
                />
              </Box>
              <Text
                variant="button"
                color={colors.button.primary.text}
                numberOfLines={1}
              >
                {label}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </Box>
  );
};

export const DealHoldToSign = memo(DealHoldToSignComponent);
