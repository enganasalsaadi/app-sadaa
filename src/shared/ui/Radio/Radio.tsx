import React, { memo, useCallback } from 'react';
import { opacity, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { RadioMark } from './RadioMark';

export interface RadioProps<T extends string> {
  value: T;
  selected: boolean;
  /** Receives the radio's `value` — pass one stable handler to every radio so `memo` holds. */
  onSelect: (value: T) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

const RadioComponent = <T extends string>({
  value,
  selected,
  onSelect,
  label,
  description,
  disabled = false,
}: RadioProps<T>) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      row
      align="center"
      gap="md"
      minHeight={sizes.button.md}
      opacity={disabled ? opacity.disabled : 1}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: selected, disabled }}
    >
      <RadioMark selected={selected} />
      <Box flex={1} gap="xs">
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="caption" color={colors.text.secondary}>
            {description}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const Radio = memo(RadioComponent) as typeof RadioComponent;
