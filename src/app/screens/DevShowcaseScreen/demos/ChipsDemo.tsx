import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, ChipGroup, CustomButton, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useChipsDemo } from './hooks/useChipsDemo';

const ChipsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    items,
    multi,
    toggleMulti,
    single,
    setSingle,
    loading,
    toggleLoading,
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
          {t('devShowcase.chips.singleTitle')}
        </Text>
        <ChipGroup
          items={items}
          value={single}
          onChange={setSingle}
          loading={loading}
          accessibilityLabel={t('devShowcase.chips.singleTitle')}
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
