import React, { memo, useCallback } from 'react';
import { Check, ChevronDown, X, type LucideIcon } from 'lucide-react-native';
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
  /** Leading icon; replaces the check of a selected chip (a filter chip names its subject). */
  icon?: LucideIcon;
  /** Opens a picker (a date filter): trailing chevron, read as a button. */
  dropdown?: boolean;
  /** A selected filter chip shows an × that clears it; needs `clearLabel`. */
  onClear?: () => void;
  clearLabel?: string;
}

const ChipComponent: React.FC<ChipProps> = ({
  label,
  value,
  selected = false,
  onSelect,
  disabled = false,
  selectionMode = 'single',
  accessibilityLabel,
  icon: Icon,
  dropdown = false,
  onClear,
  clearLabel,
}) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  const iconColor = selected ? colors.interactive.main : colors.icon.secondary;
  const clearable = selected && onClear !== undefined && clearLabel !== undefined;

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
      accessibilityRole={
        dropdown ? 'button' : selectionMode === 'multiple' ? 'checkbox' : 'radio'
      }
      accessibilityState={dropdown ? { disabled } : { checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {/* Selection is never conveyed by color alone (rule 08): check, or the clear ×. */}
      {Icon ? (
        <Icon size={sizes.icon.xs} color={iconColor} />
      ) : selected ? (
        <Check size={sizes.icon.xs} color={colors.interactive.main} strokeWidth={iconStroke.bold} />
      ) : null}
      <Text
        variant={selected ? 'bodyMedium' : 'bodySmall'}
        color={selected ? colors.interactive.text : colors.text.primary}
        numberOfLines={1}
      >
        {label}
      </Text>
      {clearable ? (
        <Pressable
          onPress={onClear}
          hitSlop={sizes.hitSlop.lg}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
        >
          <X size={sizes.icon.xs} color={colors.interactive.main} strokeWidth={iconStroke.bold} />
        </Pressable>
      ) : dropdown ? (
        <ChevronDown size={sizes.icon.xs} color={iconColor} />
      ) : null}
    </Pressable>
  );
};

export const Chip = memo(ChipComponent);
