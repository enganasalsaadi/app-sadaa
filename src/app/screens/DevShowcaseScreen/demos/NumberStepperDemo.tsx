import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, NumberStepper, Text } from '@/shared/ui';
import { useNumberStepperDemo } from './hooks/useNumberStepperDemo';

const DAYS_MIN = 1;
const DAYS_MAX = 14;

const NumberStepperDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const demo = useNumberStepperDemo();
  const formatDays = useCallback((count: number) => t('account.rates.days', { count }), [t]);
  const noop = useCallback(() => undefined, []);

  return (
    <Box gap="lg">
      <Box gap="sm">
        <Text variant="caption" color={colors.text.secondary}>
          {t('devShowcase.numberStepper.formatted')}
        </Text>
        <NumberStepper
          value={demo.days}
          onChange={demo.setDays}
          min={DAYS_MIN}
          max={DAYS_MAX}
          formatValue={formatDays}
          accessibilityLabel={t('devShowcase.numberStepper.formatted')}
        />
      </Box>
      <Box gap="sm">
        <Text variant="caption" color={colors.text.secondary}>
          {t('devShowcase.numberStepper.atMin')}
        </Text>
        <NumberStepper
          value={demo.copies}
          onChange={demo.setCopies}
          min={1}
          max={3}
          accessibilityLabel={t('devShowcase.numberStepper.atMin')}
        />
      </Box>
      <Box gap="sm">
        <Text variant="caption" color={colors.text.secondary}>
          {t('devShowcase.numberStepper.disabled')}
        </Text>
        <NumberStepper
          value={DAYS_MAX}
          onChange={noop}
          min={DAYS_MIN}
          max={DAYS_MAX}
          formatValue={formatDays}
          accessibilityLabel={t('devShowcase.numberStepper.disabled')}
          disabled
        />
      </Box>
    </Box>
  );
};

export const NumberStepperDemo = memo(NumberStepperDemoComponent);
