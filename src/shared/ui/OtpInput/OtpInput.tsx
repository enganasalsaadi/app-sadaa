import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { TextInputInstance } from 'react-native';
import { StyleSheet, TextInput, Vibration } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { HAPTIC_TAP_MS } from '@/core/config';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export type OtpInputStatus = 'idle' | 'success';

export interface OtpInputHandle {
  focus: () => void;
  /** Horizontal shake + short vibration — call after a rejected code. */
  shake: () => void;
}

export interface OtpInputProps {
  length: number;
  value: string;
  onChangeText: (value: string) => void;
  /** Fires once when the last digit is entered. */
  onComplete?: (value: string) => void;
  error?: string;
  status?: OtpInputStatus;
  editable?: boolean;
  autoFocus?: boolean;
  accessibilityLabel: string;
}

const SHAKE_STEP_MS = motion.duration.base / 5;
// Matches the ~1s blink cycle of the native text caret the hidden input replaces.
const CARET_BLINK_MS = 500;

const Caret: React.FC<{ color: string; height: number }> = ({ color, height }) => {
  const { borderWidths } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0, { duration: CARET_BLINK_MS }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <Box width={borderWidths.md} height={height} bg={color} borderRadius="full" />
    </Animated.View>
  );
};

const OtpInputComponent = forwardRef<OtpInputHandle, OtpInputProps>(
  (
    {
      length,
      value,
      onChangeText,
      onComplete,
      error,
      status = 'idle',
      editable = true,
      autoFocus,
      accessibilityLabel,
    },
    ref,
  ) => {
    const { colors, sizes, spacing, typography } = useTheme();
    const shakeOffset = spacing.sm;
    const inputRef = useRef<TextInputInstance>(null);
    const [isFocused, setIsFocused] = useState(false);
    const offset = useSharedValue(0);
    const reduceMotion = useReducedMotion();
    // focus() requested while locked (e.g. right after a rejected code, before
    // the parent re-enables us) is replayed once editable again.
    const pendingFocusRef = useRef(false);
    const editableRef = useRef(editable);
    editableRef.current = editable;

    // Going non-editable blurs natively, but RN's focus registry can keep the
    // input marked as focused, which turns every later focus() into a no-op.
    // Blur first to reset the registry, then focus.
    const focusInput = useCallback(() => {
      const input = inputRef.current;
      if (!input) return;
      if (!editableRef.current) {
        pendingFocusRef.current = true;
        return;
      }
      if (input.isFocused()) input.blur();
      input.focus();
    }, []);

    useEffect(() => {
      if (editable && pendingFocusRef.current) {
        pendingFocusRef.current = false;
        focusInput();
      }
    }, [editable, focusInput]);

    useImperativeHandle(
      ref,
      () => ({
        focus: focusInput,
        shake: () => {
          Vibration.vibrate(HAPTIC_TAP_MS);
          if (reduceMotion) return;
          offset.value = withSequence(
            withTiming(-shakeOffset, { duration: SHAKE_STEP_MS }),
            withTiming(shakeOffset, { duration: SHAKE_STEP_MS }),
            withTiming(-shakeOffset / 2, { duration: SHAKE_STEP_MS }),
            withTiming(shakeOffset / 2, { duration: SHAKE_STEP_MS }),
            withTiming(0, { duration: SHAKE_STEP_MS }),
          );
        },
      }),
      [focusInput, offset, reduceMotion, shakeOffset],
    );

    const shakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: offset.value }],
    }));

    const handleChangeText = useCallback(
      (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, length);
        onChangeText(digits);
        if (digits.length === length && value.length < length) {
          onComplete?.(digits);
        }
      },
      [length, onChangeText, onComplete, value.length],
    );

    const cellBorder = (index: number, active: boolean) => {
      if (error) return colors.status.danger.main;
      if (status === 'success') return colors.status.success.main;
      if (active) return colors.interactive.main;
      return index < value.length ? colors.border.strong : colors.border.default;
    };

    return (
      <Box gap="sm">
        <Animated.View style={shakeStyle}>
          {/* Codes are digits: always laid out LTR, also in Arabic. */}
          <Pressable
            onPress={focusInput}
            disabled={!editable}
            row
            justify="center"
            gap="md"
            style={styles.ltr}
            scaleOnPress={false}
            accessibilityRole="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {Array.from({ length }, (_, i) => {
              const digit = value[i];
              const active = isFocused && editable && i === Math.min(value.length, length - 1);
              return (
                <Box
                  key={i}
                  width={sizes.otpCell.width}
                  height={sizes.otpCell.height}
                  borderRadius="md"
                  borderWidth={active || error || status === 'success' ? 'md' : 'thin'}
                  borderColor={cellBorder(i, active)}
                  bg={colors.form.input.background}
                  align="center"
                  justify="center"
                >
                  {digit ? (
                    <Text variant="h2" color={colors.text.primary}>
                      {digit}
                    </Text>
                  ) : active ? (
                    <Caret
                      color={colors.interactive.main}
                      height={typography.h2.lineHeight}
                    />
                  ) : null}
                </Box>
              );
            })}
          </Pressable>
        </Animated.View>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          caretHidden
          accessibilityLabel={accessibilityLabel}
        />

        {error ? (
          <Text
            variant="caption"
            color={colors.form.input.error}
            align="center"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}
      </Box>
    );
  },
);

const styles = StyleSheet.create({
  ltr: { direction: 'ltr' },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export const OtpInput = memo(OtpInputComponent);
