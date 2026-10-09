import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Chip } from '@/shared/ui';
import type { TypeChip } from '../hooks/useStatementScreen';

const SEPARATOR_HEIGHT = moderateScale(24);
const PERIOD_CHIP = 'period';

interface StatementFiltersProps {
  periodLabel: string;
  periodSet: boolean;
  onOpenPeriod: () => void;
  onClearPeriod: () => void;
  typeChips: readonly TypeChip[];
  selectedType: string;
  onSelectType: (value: string) => void;
}

/** Pinned under the header: the period chip (opens the date sheet, × clears it), then one chip per type. */
const StatementFiltersComponent: React.FC<StatementFiltersProps> = ({
  periodLabel,
  periodSet,
  onOpenPeriod,
  onClearPeriod,
  typeChips,
  selectedType,
  onSelectType,
}) => {
  const { t } = useTranslation();
  const { colors, borderWidths } = useTheme();
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
      accessibilityLabel={t('finance.statement.filtersA11y')}
    >
      <Chip
        label={periodLabel}
        value={PERIOD_CHIP}
        icon={CalendarDays}
        dropdown
        selected={periodSet}
        onSelect={onOpenPeriod}
        onClear={onClearPeriod}
        clearLabel={t('finance.statement.period.clear')}
        accessibilityLabel={t('finance.statement.period.a11y', { period: periodLabel })}
      />
      <Box width={borderWidths.thin} height={SEPARATOR_HEIGHT} bg={colors.border.default} />
      <Box row gap="sm" accessibilityRole="radiogroup" accessibilityLabel={t('finance.statement.types.a11y')}>
        {typeChips.map(chip => (
          <Chip
            key={chip.value}
            label={chip.label}
            value={chip.value}
            selected={chip.value === selectedType}
            onSelect={onSelectType}
          />
        ))}
      </Box>
    </ScrollView>
  );
};

export const StatementFilters = memo(StatementFiltersComponent);
