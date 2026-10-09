import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useStyles } from '@/core/theme';
import { Chip } from '@/shared/ui';

export interface StatusChip {
  value: string;
  label: string;
}

interface StatusFilterChipsProps {
  chips: readonly StatusChip[];
  selected: string;
  onSelect: (value: string) => void;
  /** What the chips filter ("Filter top-ups"). */
  accessibilityLabel: string;
}

/** History filter row pinned under the header: All, then one chip per status (top-ups, withdrawals). */
const StatusFilterChipsComponent: React.FC<StatusFilterChipsProps> = ({
  chips,
  selected,
  onSelect,
  accessibilityLabel,
}) => {
  const styles = useStyles(({ spacing }) => ({
    content: {
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      alignItems: 'center' as const,
    },
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {chips.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          value={chip.value}
          selected={chip.value === selected}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  );
};

export const StatusFilterChips = memo(StatusFilterChipsComponent);
