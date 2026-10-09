import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarRange } from 'lucide-react-native';
import { BottomSheet, Box, DateRangePickerContent, ListRow, RadioGroup, Text } from '@/shared/ui';
import type { RadioGroupItem } from '@/shared/ui';
import type { DateSpan } from '../../../utils/statementPeriods';
import type { PeriodOption } from '../hooks/useStatementScreen';

interface StatementPeriodSheetProps {
  visible: boolean;
  onClose: () => void;
  options: readonly RadioGroupItem<PeriodOption>[];
  value: PeriodOption | undefined;
  onSelect: (option: PeriodOption) => void;
  customSelected: boolean;
  customLabel: string | null;
  customSpan: DateSpan;
  onConfirmCustom: (from: Date, to: Date) => void;
}

/**
 * The date filter: ready-made periods apply on tap; "Custom range" turns the same sheet
 * into a calendar of past days (one sheet, so two modals never race).
 */
const StatementPeriodSheetComponent: React.FC<StatementPeriodSheetProps> = ({
  visible,
  onClose,
  options,
  value,
  onSelect,
  customSelected,
  customLabel,
  customSpan,
  onConfirmCustom,
}) => {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);

  const close = useCallback(() => {
    setPicking(false);
    onClose();
  }, [onClose]);
  const startPicking = useCallback(() => setPicking(true), []);

  return (
    <BottomSheet visible={visible} onClose={close}>
      {picking ? (
        <DateRangePickerContent
          visible={visible && picking}
          onClose={close}
          checkIn={customSpan.from}
          checkOut={customSpan.to}
          onConfirm={onConfirmCustom}
          range="past"
        />
      ) : (
        <Box px="lg" pb="lg" gap="sm">
          <Text variant="h4" accessibilityRole="header">
            {t('finance.statement.period.title')}
          </Text>
          <RadioGroup
            items={options}
            value={value}
            onChange={onSelect}
            accessibilityLabel={t('finance.statement.period.title')}
          />
          <ListRow
            icon={CalendarRange}
            title={t('finance.statement.period.custom')}
            value={customSelected && customLabel ? customLabel : undefined}
            onPress={startPicking}
          />
        </Box>
      )}
    </BottomSheet>
  );
};

export const StatementPeriodSheet = memo(StatementPeriodSheetComponent);
