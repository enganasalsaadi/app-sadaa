import React, { memo, useCallback, useRef } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Chip } from '../Chip';
import { Skeleton } from '../Skeleton';

export interface ChipGroupItem {
  label: string;
  value: string;
}

interface ChipGroupSingleProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string) => void;
}

interface ChipGroupMultipleProps {
  /** Checkable chips; `value` is the selected list, in pick order. */
  multiple: true;
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** Once reached, unselected chips are disabled until one is removed. */
  max?: number;
}

export type ChipGroupProps = (ChipGroupSingleProps | ChipGroupMultipleProps) & {
  items: readonly ChipGroupItem[];
  /** Group name read by screen readers ("Governorate"). */
  accessibilityLabel: string;
  disabled?: boolean;
  /** Shows placeholder chips while options load (reserves the space, no jump). */
  loading?: boolean;
  skeletonCount?: number;
};

// Varied widths so the placeholder reads as chips, not a table.
const SKELETON_WIDTHS = [72, 96, 64, 88, 80, 104, 68, 92].map(w =>
  moderateScale(w),
);
const FIRST_SKELETON_WIDTH = SKELETON_WIDTHS[0] ?? 0;

const ChipGroupComponent: React.FC<ChipGroupProps> = props => {
  const {
    items,
    accessibilityLabel,
    disabled = false,
    loading = false,
    skeletonCount = 6,
  } = props;
  const { sizes } = useTheme();

  // Kept in a ref so the toggle handler stays stable and `Chip`'s memo holds.
  const propsRef = useRef(props);
  propsRef.current = props;
  const handleSelect = useCallback((picked: string) => {
    const current = propsRef.current;
    if (!current.multiple) {
      current.onChange(picked);
      return;
    }
    current.onChange(
      current.value.includes(picked)
        ? current.value.filter(v => v !== picked)
        : [...current.value, picked],
    );
  }, []);

  if (loading) {
    return (
      <Box row wrap gap="sm" accessibilityElementsHidden>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Skeleton
            key={i}
            width={SKELETON_WIDTHS[i % SKELETON_WIDTHS.length] ?? FIRST_SKELETON_WIDTH}
            height={sizes.button.md}
            borderRadius="md"
          />
        ))}
      </Box>
    );
  }

  const isSelected = (itemValue: string) =>
    props.multiple ? props.value.includes(itemValue) : props.value === itemValue;
  const atMax =
    props.multiple && props.max !== undefined && props.value.length >= props.max;

  return (
    <Box
      row
      wrap
      gap="sm"
      accessibilityRole={props.multiple ? undefined : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
    >
      {items.map(item => {
        const selected = isSelected(item.value);
        return (
          <Chip
            key={item.value}
            label={item.label}
            value={item.value}
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled || (atMax && !selected)}
            selectionMode={props.multiple ? 'multiple' : 'single'}
          />
        );
      })}
    </Box>
  );
};

export const ChipGroup = memo(ChipGroupComponent);
