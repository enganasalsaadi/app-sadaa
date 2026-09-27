import React, { memo, useCallback } from 'react';
import { opacity, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

interface SegmentProps<T extends string> {
  option: SegmentedOption<T>;
  selected: boolean;
  disabled: boolean;
  onSelect: (value: T) => void;
}

const SegmentComponent = <T extends string>({
  option,
  selected,
  disabled,
  onSelect,
}: SegmentProps<T>) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(option.value), [onSelect, option.value]);

  return (
    <Pressable
      flex={1}
      onPress={handlePress}
      disabled={disabled}
      minHeight={sizes.button.md}
      px="sm"
      align="center"
      justify="center"
      borderRadius="md"
      bg={selected ? colors.surface.main : colors.layout.transparent}
      shadow={selected ? 'sm' : 'none'}
      accessibilityRole="tab"
      accessibilityLabel={option.label}
      accessibilityState={{ selected, disabled }}
    >
      <Text
        variant={selected ? 'bodyMedium' : 'bodySmall'}
        color={selected ? colors.text.primary : colors.text.secondary}
        numberOfLines={1}
      >
        {option.label}
      </Text>
    </Pressable>
  );
};

const Segment = memo(SegmentComponent) as typeof SegmentComponent;

/** 2–4 mutually exclusive views of the same content (Active / Completed). More → `Tabs`. */
const SegmentedControlComponent = <T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
}: SegmentedControlProps<T>) => {
  const { colors } = useTheme();

  return (
    <Box
      row
      p="xs"
      gap="xs"
      borderRadius="lg"
      bg={colors.surface.elevated}
      opacity={disabled ? opacity.disabled : 1}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map(option => (
        <Segment
          key={option.value}
          option={option}
          selected={option.value === value}
          disabled={disabled}
          onSelect={onChange}
        />
      ))}
    </Box>
  );
};

export const SegmentedControl = memo(
  SegmentedControlComponent,
) as typeof SegmentedControlComponent;
