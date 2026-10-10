import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react-native';
import { Box, Chip, ChipGroup, ChipRow, CustomButton, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useChipsDemo } from './hooks/useChipsDemo';

const CHIPS_DEMO_MAX = 3;

const ChipsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    items,
    multi,
    toggleMulti,
    single,
    setSingle,
    groupMulti,
    setGroupMulti,
    loading,
    toggleLoading,
    dateSet,
    pickDate,
    clearDate,
  } = useChipsDemo();

  return (
    <Box gap="lg">
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.chips.multiTitle')}
        </Text>
        <Box row wrap gap="sm">
          {items.map(item => (
            <Chip
              key={item.value}
              label={item.label}
              value={item.value}
              selected={multi.has(item.value)}
              onSelect={toggleMulti}
            />
          ))}
          <Chip
            label={t('devShowcase.chips.disabled')}
            value="disabled"
            onSelect={toggleMulti}
            disabled
          />
        </Box>
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.chips.filterTitle')}
        </Text>
        <Box row wrap gap="sm">
          <Chip
            label={t(dateSet ? 'devShowcase.chips.filterSet' : 'devShowcase.chips.filterAll')}
            value="date"
            icon={CalendarDays}
            dropdown
            selected={dateSet}
            onSelect={pickDate}
            onClear={clearDate}
            clearLabel={t('devShowcase.chips.filterClear')}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.chips.rowTitle')}
        </Text>
        <ChipRow accessibilityRole="radiogroup" accessibilityLabel={t('devShowcase.chips.rowTitle')}>
          {items.map(item => (
            <Chip
              key={item.value}
              label={item.label}
              value={item.value}
              selected={item.value === single}
              onSelect={setSingle}
            />
          ))}
        </ChipRow>
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.chips.singleTitle')}
        </Text>
        <ChipGroup
          items={items}
          value={single}
          onChange={setSingle}
          loading={loading}
          accessibilityLabel={t('devShowcase.chips.singleTitle')}
        />
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.chips.groupMultiTitle', { count: CHIPS_DEMO_MAX })}
        </Text>
        <ChipGroup
          multiple
          max={CHIPS_DEMO_MAX}
          items={items}
          value={groupMulti}
          onChange={setGroupMulti}
          loading={loading}
          accessibilityLabel={t('devShowcase.chips.groupMultiTitle', { count: CHIPS_DEMO_MAX })}
        />
        <CustomButton
          title={t('devShowcase.chips.toggleLoading')}
          onPress={toggleLoading}
          variant="ghost"
          size="sm"
        />
      </Box>
    </Box>
  );
};

export const ChipsDemo = memo(ChipsDemoComponent);
