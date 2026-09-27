import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  TextInputProps,
  TextInputInstance,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TextInput } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type { SpacingToken, RadiiToken } from '@/core/theme/types';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import type { InputSize } from './styles';
import {
  getInputColors,
  getInputHeight,
  getFieldFrameStyle,
  createInputTextStyle,
  createMultilineContainerStyle,
} from './styles';

interface IconProps {
  color?: string;
  size?: number;
}

export interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  size?: InputSize;
  isPassword?: boolean;
  leftIcon?: React.ReactElement<IconProps>;
  rightIcon?: React.ReactElement<IconProps>;
  borderRadius?: RadiiToken;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
  /** `value.length / maxLength` under the field (briefs, bios). Needs `maxLength`. */
  showCount?: boolean;
  /** Unit at the trailing end (currency code, `%`, `min`). */
  suffix?: string;
  mb?: SpacingToken;
}

const CustomInputInner = React.forwardRef(
  (
    {
      label,
      error,
      size = 'lg',
      isPassword = false,
      leftIcon,
      rightIcon,
      borderRadius = 'md',
      containerStyle,
      inputStyle,
      editable = true,
      multiline = false,
      numberOfLines = 4,
      showCount = false,
      suffix,
      mb: mbProp,
      onFocus,
      onBlur,
      ...rest
    }: CustomInputProps,
    ref: React.ForwardedRef<TextInputInstance>,
  ) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    const [secureEntry, setSecureEntry] = useState(isPassword);

    useEffect(() => {
      setSecureEntry(isPassword);
    }, [isPassword]);

    const ic = useMemo(() => getInputColors(theme), [theme]);
    const inputHeight = useMemo(
      () => getInputHeight(size, theme),
      [size, theme],
    );
    const baseTextStyle = useMemo(() => createInputTextStyle(theme), [theme]);
    const multilineStyle = useMemo(
      () =>
        multiline
          ? createMultilineContainerStyle(theme, numberOfLines)
          : undefined,
      [multiline, numberOfLines, theme],
    );

    const isRTL = theme.isRTL;

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const toggleSecureEntry = useCallback(() => {
      setSecureEntry(prev => !prev);
    }, []);

    const iconColor = editable
      ? theme.colors.icon.secondary
      : theme.colors.icon.disabled;
    const iconSize = theme.sizes.icon.sm;

    const clonedLeftIcon = useMemo(
      () =>
        leftIcon
          ? React.cloneElement(leftIcon, { color: iconColor, size: iconSize })
          : null,
      [leftIcon, iconColor, iconSize],
    );

    const clonedRightIcon = useMemo(
      () =>
        rightIcon
          ? React.cloneElement(rightIcon, { color: iconColor, size: iconSize })
          : null,
      [rightIcon, iconColor, iconSize],
    );

    const hasError = !!error;
    const counter =
      showCount && rest.maxLength !== undefined
        ? `${formatNumber(rest.value?.length ?? 0)}/${formatNumber(rest.maxLength)}`
        : undefined;
    const wrapperStyle = useMemo<ViewStyle>(
      () => ({
        ...getFieldFrameStyle(theme, {
          focused: isFocused,
          error: hasError,
          editable,
          borderRadius,
        }),
        alignItems: multiline ? 'flex-start' : 'center',
        height: multiline ? undefined : inputHeight,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
        ...(multiline ? multilineStyle : {}),
      }),
      [
        theme,
        isFocused,
        hasError,
        editable,
        borderRadius,
        multiline,
        inputHeight,
        multilineStyle,
      ],
    );

    const mergedTextStyle = useMemo<TextStyle>(
      () => ({
        ...baseTextStyle,
        textAlign: isRTL ? 'right' : 'left',
        writingDirection: isRTL ? 'rtl' : 'ltr',
        ...(inputStyle ?? {}),
      }),
      [baseTextStyle, isRTL, inputStyle],
    );

    return (
      <Box mb={mbProp} style={containerStyle}>
        {label ? (
          <Text variant="label" color={ic.label} mb="md">
            {label}
          </Text>
        ) : null}

        <Box style={wrapperStyle}>
          {isPassword ? (
            <Pressable
              onPress={toggleSecureEntry}
              hitSlop={theme.sizes.hitSlop.lg}
              align="center"
              justify="center"
              accessibilityRole="button"
              accessibilityLabel={
                secureEntry
                  ? t('common.showPassword')
                  : t('common.hidePassword')
              }
            >
              {secureEntry ? (
                <EyeOff size={iconSize} color={iconColor} />
              ) : (
                <Eye size={iconSize} color={iconColor} />
              )}
            </Pressable>
          ) : (
            clonedLeftIcon
          )}
          <TextInput
            ref={ref}
            style={mergedTextStyle}
            editable={editable}
            secureTextEntry={secureEntry}
            placeholderTextColor={ic.placeholder}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : undefined}
            textAlignVertical={multiline ? 'top' : 'center'}
            accessibilityLabel={
              rest.accessibilityLabel ?? label ?? rest.placeholder
            }
            accessibilityState={{ disabled: !editable }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {suffix ? (
            <Text
              variant="bodyMedium"
              color={editable ? theme.colors.text.secondary : theme.colors.text.tertiary}
            >
              {suffix}
            </Text>
          ) : null}
          {clonedRightIcon}
        </Box>

        {error || counter ? (
          <Box row justify="space-between" gap="md" mt="sm">
            <Text
              variant="caption"
              color={theme.colors.form.input.error}
              accessibilityRole={error ? 'alert' : undefined}
            >
              {error}
            </Text>
            {counter ? (
              <Text variant="caption" color={theme.colors.text.tertiary}>
                {counter}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  },
);

export const CustomInput = React.memo(CustomInputInner);
