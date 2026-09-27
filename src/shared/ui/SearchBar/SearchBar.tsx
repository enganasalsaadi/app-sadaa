import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import type { TextInputInstance, TextStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { createInputTextStyle, getInputColors } from '../CustomInput/styles';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit?: (text: string) => void;
  /** Spinner in place of the clear button while results load. */
  loading?: boolean;
  autoFocus?: boolean;
}

/** Search field for list/filter screens. Debounce in the screen hook, not here. */
const SearchBarComponent = forwardRef<TextInputInstance, SearchBarProps>(
  ({ value, onChangeText, placeholder, onSubmit, loading = false, autoFocus }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, sizes, isRTL } = theme;
    const [focused, setFocused] = useState(false);
    const ic = useMemo(() => getInputColors(theme), [theme]);
    const textStyle = useMemo<TextStyle>(
      () => ({
        ...createInputTextStyle(theme),
        textAlign: isRTL ? 'right' : 'left',
        writingDirection: isRTL ? 'rtl' : 'ltr',
      }),
      [theme, isRTL],
    );

    const handleFocus = useCallback(() => setFocused(true), []);
    const handleBlur = useCallback(() => setFocused(false), []);
    const handleClear = useCallback(() => onChangeText(''), [onChangeText]);
    const handleSubmit = useCallback(() => onSubmit?.(value), [onSubmit, value]);

    return (
      <Box
        row
        align="center"
        gap="sm"
        px="md"
        height={sizes.input.md}
        borderRadius="md"
        bg={ic.background}
        borderWidth={focused ? 'sm' : 'thin'}
        borderColor={focused ? ic.focusBorder : ic.border}
      >
        <Search size={sizes.icon.sm} color={colors.icon.secondary} />
        <TextInput
          ref={ref}
          style={textStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={ic.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        />
        {loading ? (
          <ActivityIndicator size="small" color={colors.icon.secondary} />
        ) : value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            hitSlop={sizes.hitSlop.lg}
            accessibilityRole="button"
            accessibilityLabel={t('common.clear')}
          >
            <X size={sizes.icon.sm} color={colors.icon.secondary} />
          </Pressable>
        ) : null}
      </Box>
    );
  },
);

export const SearchBar = memo(SearchBarComponent);
