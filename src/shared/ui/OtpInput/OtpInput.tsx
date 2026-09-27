import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export interface OtpInputProps {
  length: number;
  value: string;
  onChangeText: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  accessibilityLabel: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length,
  value,
  onChangeText,
  onComplete,
  error,
  autoFocus,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const inputRef = useRef<TextInputInstance>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length);
      onChangeText(digits);
      if (digits.length === length) {
        onComplete?.(digits);
      }
    },
    [length, onChangeText, onComplete],
  );

  const cells = useMemo(() => Array.from({ length }, (_, i) => i), [length]);

  return (
    <Box>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        row
        justify="center"
        gap="md"
        accessibilityRole="none"
      >
        {cells.map(i => {
          const digit = value[i];
          const active = isFocused && i === value.length;
          const borderColor = error
            ? colors.form.input.borderError
            : active
              ? colors.interactive.main
              : colors.border.default;

          return (
            <Box
              key={i}
              width={48}
              height={56}
              borderRadius="md"
              borderWidth={active ? 'sm' : 'thin'}
              borderColor={borderColor}
              bg={colors.form.input.background}
              align="center"
              justify="center"
            >
              <Text variant="h3" color={colors.text.primary}>
                {digit ?? ''}
              </Text>
            </Box>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel}
      />

      {error ? (
        <Text
          variant="caption"
          color={colors.form.input.error}
          mt="sm"
          align="center"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
