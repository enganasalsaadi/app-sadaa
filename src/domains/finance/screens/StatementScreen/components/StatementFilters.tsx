import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Chip, ChipRow } from '@/shared/ui';
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

  return (
    <ChipRow accessibilityLabel={t('finance.statement.filtersA11y')}>
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
    </ChipRow>
  );
};

export const StatementFilters = memo(StatementFiltersComponent);
