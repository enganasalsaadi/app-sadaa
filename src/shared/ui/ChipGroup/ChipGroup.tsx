import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Chip } from '../Chip';
import { Skeleton } from '../Skeleton';

export interface ChipGroupItem {
  label: string;
  value: string;
}

export interface ChipGroupProps {
  items: readonly ChipGroupItem[];
  value: string | null;
  onChange: (value: string) => void;
  /** Group name read by screen readers ("Governorate"). */
  accessibilityLabel: string;
  disabled?: boolean;
  /** Shows placeholder chips while options load (reserves the space, no jump). */
  loading?: boolean;
  skeletonCount?: number;
}

// Varied widths so the placeholder reads as chips, not a table.
const SKELETON_WIDTHS = [72, 96, 64, 88, 80, 104, 68, 92].map(w =>
  moderateScale(w),
);
const FIRST_SKELETON_WIDTH = SKELETON_WIDTHS[0] ?? 0;

const ChipGroupComponent: React.FC<ChipGroupProps> = ({
  items,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  loading = false,
  skeletonCount = 6,
}) => {
  const { sizes } = useTheme();

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

  return (
    <Box
      row
      wrap
      gap="sm"
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {items.map(item => (
        <Chip
          key={item.value}
          label={item.label}
          value={item.value}
          selected={item.value === value}
          onSelect={onChange}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};

export const ChipGroup = memo(ChipGroupComponent);
