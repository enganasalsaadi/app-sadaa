import React, { memo, useCallback } from 'react';
import { Check } from 'lucide-react-native';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export interface ChipProps {
  label: string;
  value: string;
  selected?: boolean;
  /** Receives the chip's `value` — pass one stable handler to every chip so `memo` holds. */
  onSelect: (value: string) => void;
  disabled?: boolean;
  /** `multiple` = one of several checkable chips (reads as a checkbox). */
  selectionMode?: 'single' | 'multiple';
  accessibilityLabel?: string;
}

const ChipComponent: React.FC<ChipProps> = ({
  label,
  value,
  selected = false,
  onSelect,
  disabled = false,
  selectionMode = 'single',
  accessibilityLabel,
}) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      row
      align="center"
      justify="center"
      gap="xs"
      px="lg"
      minHeight={sizes.button.md}
      borderRadius="md"
      borderWidth={selected ? 'sm' : 'thin'}
      borderColor={selected ? colors.interactive.main : colors.border.default}
      bg={selected ? colors.interactive.soft : colors.surface.main}
      scaleOnPress
      opacity={disabled ? opacity.disabled : 1}
      accessibilityRole={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {/* Selection is never conveyed by color alone (rule 08). */}
      {selected ? (
        <Check size={sizes.icon.xs} color={colors.interactive.main} strokeWidth={iconStroke.bold} />
      ) : null}
      <Text
        variant={selected ? 'bodyMedium' : 'bodySmall'}
        color={selected ? colors.interactive.text : colors.text.primary}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const Chip = memo(ChipComponent);
