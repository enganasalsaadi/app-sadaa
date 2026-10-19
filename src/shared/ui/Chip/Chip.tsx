import React, { memo, useCallback } from 'react';
import { Check, ChevronDown, X, type LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

/**
 * `outline` = filter / field chip · `tile` = discovery shortcut (soft teal pill, rule 08) ·
 * `solid` = one view of a list (the chosen one filled, the rest bare with a hairline).
 */
export type ChipVariant = 'outline' | 'tile' | 'solid';

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
  /** How many items the chip holds; shown quietly after the label (0 shows nothing). */
  count?: number;
  /** Something inside waits on the user: a small amber dot while the chip is not the chosen one. */
  attention?: boolean;
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
  count = 0,
  attention = false,
}) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  const tile = variant === 'tile';
  const solid = variant === 'solid';
  const clearable = selected && onClear !== undefined && clearLabel !== undefined;
  // A selected tile is a filled pill (`button.primary`), so its content takes the button text.
  const filled = (tile || solid) && selected;
  const accentColor = filled ? colors.button.primary.text : colors.interactive.main;
  const iconColor = selected || tile ? accentColor : colors.icon.secondary;
  const labelColor = filled
    ? colors.button.primary.text
    : solid
      ? colors.text.secondary
      : tile
        ? colors.text.primary
        : selected
          ? colors.interactive.text
          : colors.text.primary;
  const bg = solid
    ? selected
      ? colors.button.primary.bg
      : colors.layout.transparent
    : tile
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
      px={solid ? 'md' : 'lg'}
      minHeight={solid ? sizes.button.sm : sizes.button.md}
      borderRadius={tile || solid ? 'full' : 'md'}
      borderWidth={tile ? 'none' : solid ? (selected ? 'none' : 'thin') : selected ? 'sm' : 'thin'}
      borderColor={selected ? colors.interactive.main : colors.border.default}
      bg={bg}
      scaleOnPress
      hitSlop={solid ? sizes.hitSlop.sm : undefined}
      opacity={disabled ? opacity.disabled : 1}
      accessibilityRole={
        dropdown ? 'button' : selectionMode === 'multiple' ? 'checkbox' : 'radio'
      }
      accessibilityState={dropdown ? { disabled } : { checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? (count > 0 ? `${label}, ${formatNumber(count)}` : label)}
    >
      {attention && !selected ? (
        <Box width={sizes.dot.sm} height={sizes.dot.sm} borderRadius="full" bg={colors.status.warning.main} />
      ) : null}
      {/* Selection is never conveyed by color alone (rule 08): check, or the clear ×. */}
      {Icon ? (
        <Icon size={tile ? sizes.icon.sm : sizes.icon.xs} color={iconColor} />
      ) : selected && !solid ? (
        <Check size={sizes.icon.xs} color={accentColor} strokeWidth={iconStroke.bold} />
      ) : null}
      <Text
        variant={solid && selected ? 'bodyMedium' : 'bodySmall'}
        color={labelColor}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count > 0 ? (
        <Text variant="caption" color={filled ? labelColor : colors.text.tertiary} numberOfLines={1}>
          {formatNumber(count)}
        </Text>
      ) : null}
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
