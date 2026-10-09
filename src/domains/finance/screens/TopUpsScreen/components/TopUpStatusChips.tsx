import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles } from '@/core/theme';
import { Chip } from '@/shared/ui';

export interface StatusChip {
  value: string;
  label: string;
}

interface TopUpStatusChipsProps {
  chips: readonly StatusChip[];
  selected: string;
  onSelect: (value: string) => void;
}

/** Pinned under the header: All, then one chip per status. */
const TopUpStatusChipsComponent: React.FC<TopUpStatusChipsProps> = ({ chips, selected, onSelect }) => {
  const { t } = useTranslation();
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
      accessibilityLabel={t('finance.topUp.history.filtersA11y')}
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

export const TopUpStatusChips = memo(TopUpStatusChipsComponent);
