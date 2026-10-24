import React, { useMemo, useState, useCallback } from 'react';
import type {
  TextInputProps,
  TextInputInstance,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TextInput } from 'react-native';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/core/config';
import { useTheme } from '@/core/theme';
import { isolateLtr } from '@/shared/utils';
import type { SpacingToken, RadiiToken } from '@/core/theme/types';
import { Box, Text } from '../primitives';
import type { InputSize } from '../CustomInput/styles';
import {
  getInputColors,
  getInputHeight,
  getFieldFrameStyle,
  createInputTextStyle,
} from '../CustomInput/styles';

export interface PhoneInputProps {
  label?: string;
  placeholder: string;
  /** National digits as typed, trunk 0 included ("0944123456"); the form builds E.164 on submit. */
  value: string;
  onChangeText: (nationalNumber: string) => void;
  error?: string;
  size?: InputSize;
  borderRadius?: RadiiToken;
  mb?: SpacingToken;
  editable?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  testID?: string;
}

const PhoneInputInner = React.forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      error,
      size = 'lg',
      borderRadius = 'md',
      mb,
      editable = true,
      returnKeyType,
      onSubmitEditing,
      testID,
    }: PhoneInputProps,
    ref: React.ForwardedRef<TextInputInstance>,
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const ic = useMemo(() => getInputColors(theme), [theme]);
    const inputHeight = useMemo(
      () => getInputHeight(size, theme),
      [size, theme],
    );
    const baseTextStyle = useMemo(() => createInputTextStyle(theme), [theme]);

    const isRTL = theme.isRTL;

    const hasError = !!error;
    const wrapperStyle = useMemo<ViewStyle>(
      () => ({
        ...getFieldFrameStyle(theme, {
          focused: isFocused,
          error: hasError,
          editable,
          borderRadius,
        }),
        height: inputHeight,
        overflow: 'hidden',
      }),
      [theme, isFocused, hasError, editable, borderRadius, inputHeight],
    );

    const textInputStyle = useMemo<TextStyle>(
      () => ({
        ...baseTextStyle,
        textAlign: isRTL ? 'right' : 'left',
        writingDirection: 'ltr',
        paddingHorizontal: theme.spacing.md,
      }),
      [baseTextStyle, isRTL, theme.spacing.md],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        const digits = text.replace(/\D/g, '');
        onChangeText(digits);
      },
      [onChangeText],
    );

    return (
      <Box mb={mb}>
        {label ? (
          <Text variant="label" color={ic.label} mb="md">
            {label}
          </Text>
        ) : null}

        <Box style={wrapperStyle}>
          <TextInput
            ref={ref}
            style={textInputStyle}
            value={value}
            onChangeText={handleChangeText}
            keyboardType="phone-pad"
            editable={editable}
            placeholderTextColor={ic.placeholder}
            // "0944 123 456" has no letter to anchor it: left to RTL it reads "456 123 0944".
            placeholder={isolateLtr(placeholder)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textContentType="telephoneNumber"
            maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
            accessibilityLabel={label}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            testID={testID}
          />
        </Box>

        {error ? (
          <Text
            variant="caption"
            color={theme.colors.form.input.error}
            mt="sm"
            accessibilityRole="alert"
            testID={testID ? `${testID}.error` : undefined}
          >
            {error}
          </Text>
        ) : null}

      </Box>
    );
  },
);

export const PhoneInput = React.memo(PhoneInputInner);
