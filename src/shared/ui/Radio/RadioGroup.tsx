import React, { memo } from 'react';
import { Box } from '../primitives/Box';
import { Radio } from './Radio';

export interface RadioGroupItem<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  items: readonly RadioGroupItem<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

/** Vertical single choice with descriptions. Short options in a row → `ChipGroup`. */
const RadioGroupComponent = <T extends string>({
  items,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
}: RadioGroupProps<T>) => (
  <Box accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
    {items.map(item => (
      <Radio
        key={item.value}
        value={item.value}
        selected={item.value === value}
        onSelect={onChange}
        label={item.label}
        description={item.description}
        disabled={disabled || item.disabled}
      />
    ))}
  </Box>
);

export const RadioGroup = memo(RadioGroupComponent) as typeof RadioGroupComponent;
