import React, { memo, useCallback } from 'react';
import { Check, ChevronDown, X, type LucideIcon } from 'lucide-react-native';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

/** `outline` = filter / field chip · `tile` = discovery shortcut (soft teal pill, rule 08). */
export type ChipVariant = 'outline' | 'tile';

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
  /** Default `outline`. */
  variant?: ChipVariant;
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
  variant = 'outline',
}) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  const tile = variant === 'tile';
  const clearable = selected && onClear !== undefined && clearLabel !== undefined;
  // A selected tile is a filled pill (`button.primary`), so its content takes the button text.
  const accentColor = tile && selected ? colors.button.primary.text : colors.interactive.main;
  const iconColor = selected || tile ? accentColor : colors.icon.secondary;
  const labelColor = tile
    ? selected
      ? colors.button.primary.text
      : colors.text.primary
    : selected
      ? colors.interactive.text
      : colors.text.primary;
  const bg = tile
    ? selected
      ? colors.button.primary.bg
      : colors.interactive.soft
    : selected
      ? colors.interactive.soft
      : colors.surface.main;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      row
      align="center"
      justify="center"
      gap={tile ? 'sm' : 'xs'}
      px="lg"
      minHeight={sizes.button.md}
      borderRadius={tile ? 'full' : 'md'}
      borderWidth={tile ? 'none' : selected ? 'sm' : 'thin'}
      borderColor={selected ? colors.interactive.main : colors.border.default}
      bg={bg}
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
        <Icon size={tile ? sizes.icon.sm : sizes.icon.xs} color={iconColor} />
      ) : selected ? (
        <Check size={sizes.icon.xs} color={accentColor} strokeWidth={iconStroke.bold} />
      ) : null}
      <Text
        variant={selected || tile ? 'bodyMedium' : 'bodySmall'}
        color={labelColor}
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
          <X size={sizes.icon.xs} color={accentColor} strokeWidth={iconStroke.bold} />
        </Pressable>
      ) : dropdown ? (
        <ChevronDown size={sizes.icon.xs} color={iconColor} />
      ) : null}
    </Pressable>
  );
};

export const Chip = memo(ChipComponent);
