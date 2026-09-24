import React, { useMemo, useState, useCallback } from 'react';
import type {
  TextInputProps,
  TextInputInstance,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TextInput, Platform } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { CountryCode } from 'libphonenumber-js';
import { useTheme } from '@/core/theme';
import type { SpacingToken, RadiiToken } from '@/core/theme/types';
import { Box, Text, Pressable } from '../primitives';
import type { InputSize } from '../CustomInput/styles';
import {
  getInputColors,
  getInputHeight,
  createInputTextStyle,
} from '../CustomInput/styles';
import { CountryPickerSheet } from './CountryPickerSheet';
import { getFlagEmoji, findCountry } from './countryData';

export interface PhoneInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (nationalNumber: string) => void;
  countryCode: CountryCode;
  onChangeCountry: (code: CountryCode) => void;
  error?: string;
  size?: InputSize;
  borderRadius?: RadiiToken;
  mb?: SpacingToken;
  editable?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
}

const PhoneInputInner = React.forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      countryCode,
      onChangeCountry,
      error,
      size = 'lg',
      borderRadius = 'md',
      mb,
      editable = true,
      returnKeyType,
      onSubmitEditing,
    }: PhoneInputProps,
    ref: React.ForwardedRef<TextInputInstance>,
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    const ic = useMemo(() => getInputColors(theme), [theme]);
    const inputHeight = useMemo(
      () => getInputHeight(size, theme),
      [size, theme],
    );
    const baseTextStyle = useMemo(() => createInputTextStyle(theme), [theme]);

    const country = useMemo(() => findCountry(countryCode), [countryCode]);
    const flag = useMemo(() => getFlagEmoji(countryCode), [countryCode]);
    const isRTL = theme.isRTL;

    const borderColor = isFocused
      ? ic.focusBorder
      : error
      ? theme.colors.form.input.borderError
      : ic.border;
    const borderWidth = isFocused
      ? theme.borderWidths.sm
      : theme.borderWidths.thin;
    const backgroundColor = editable ? ic.background : ic.disabledBg;

    const wrapperStyle = useMemo<ViewStyle>(
      () => ({
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        backgroundColor,
        borderRadius: theme.radii[borderRadius],
        borderWidth,
        borderColor,
        height: inputHeight,
        overflow: 'hidden',
      }),
      [
        isRTL,
        backgroundColor,
        theme,
        borderRadius,
        borderWidth,
        borderColor,
        inputHeight,
      ],
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

    const dialCodeStyle = useMemo<TextStyle>(
      () => ({ direction: 'ltr' }),
      [],
    );

    const dividerStyle = useMemo<ViewStyle>(
      () => ({
        borderEndWidth: theme.borderWidths.thin,
        borderEndColor: ic.border,
        height: '60%',
      }),
      [theme.borderWidths.thin, ic.border],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        const digits = text.replace(/\D/g, '');
        onChangeText(digits);
      },
      [onChangeText],
    );

    const openPicker = useCallback(() => {
      if (editable) setPickerVisible(true);
    }, [editable]);

    return (
      <Box mb={mb}>
        {label ? (
          <Text variant="label" color={ic.label} mb="sm">
            {label}
          </Text>
        ) : null}

        <Box style={wrapperStyle}>
          {/* Country selector trigger */}
          <Pressable
            onPress={openPicker}
            row
            align="center"
            px="md"
            gap="xs"
            height={inputHeight}
            scaleOnPress={false}
            accessibilityRole="button"
            accessibilityLabel={`${flag} +${country?.dialCode}`}
          >
            <Text
              variant="label"
              color={theme.colors.text.secondary}
              style={dialCodeStyle}
            >
              {isRTL && Platform.OS === 'ios'
                ? country?.dialCode + '+'
                : '+' + country?.dialCode}
            </Text>
            <ChevronDown
              size={14}
              color={
                editable
                  ? theme.colors.icon.secondary
                  : theme.colors.icon.disabled
              }
            />
          </Pressable>

          {/* Vertical divider */}
          <Box style={dividerStyle} />

          {/* Number input */}
          <TextInput
            ref={ref}
            style={textInputStyle}
            value={value}
            onChangeText={handleChangeText}
            keyboardType="phone-pad"
            editable={editable}
            placeholderTextColor={ic.placeholder}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textContentType="telephoneNumber"
            maxFontSizeMultiplier={1.3}
            accessibilityLabel={label}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
          />
        </Box>

        {error ? (
          <Text
            variant="caption"
            color={theme.colors.form.input.error}
            mt="sm"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}

        <CountryPickerSheet
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelect={code => {
            onChangeCountry(code);
            setPickerVisible(false);
          }}
          selected={countryCode}
        />
      </Box>
    );
  },
);

export const PhoneInput = React.memo(PhoneInputInner);
