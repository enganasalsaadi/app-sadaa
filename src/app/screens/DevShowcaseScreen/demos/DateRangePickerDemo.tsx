import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, DateRangePicker, Text } from '@/shared/ui';
import { formatDate } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { useDateRangeDemo } from './hooks/useDateRangeDemo';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const DateRangePickerDemoComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { picker, range, onConfirm, pastPicker, pastRange, onConfirmPast } = useDateRangeDemo();

  const label = useMemo(
    () =>
      t('devShowcase.dateRange.selected', {
        start: formatDate(range.start, DATE_FORMAT, i18n.language),
        end: formatDate(range.end, DATE_FORMAT, i18n.language),
      }),
    [t, range, i18n.language],
  );
  const pastLabel = useMemo(
    () =>
      t('devShowcase.dateRange.selected', {
        start: formatDate(pastRange.start, DATE_FORMAT, i18n.language),
        end: formatDate(pastRange.end, DATE_FORMAT, i18n.language),
      }),
    [t, pastRange, i18n.language],
  );

  return (
    <Box gap="md">
      <Text variant="bodySmall" color={colors.text.secondary}>
        {label}
      </Text>
      <CustomButton
        title={t('devShowcase.dateRange.open')}
        onPress={picker.open}
        variant="outline"
      />
      <DateRangePicker
        visible={picker.visible}
        onClose={picker.close}
        checkIn={range.start}
        checkOut={range.end}
        onConfirm={onConfirm}
      />

      <Text variant="label" color={colors.text.secondary}>
        {t('devShowcase.dateRange.pastTitle')}
      </Text>
      <Text variant="bodySmall" color={colors.text.secondary}>
        {pastLabel}
      </Text>
      <CustomButton
        title={t('devShowcase.dateRange.openPast')}
        onPress={pastPicker.open}
        variant="outline"
      />
      <DateRangePicker
        visible={pastPicker.visible}
        onClose={pastPicker.close}
        checkIn={pastRange.start}
        checkOut={pastRange.end}
        onConfirm={onConfirmPast}
        range="past"
      />
    </Box>
  );
};

export const DateRangePickerDemo = memo(DateRangePickerDemoComponent);
