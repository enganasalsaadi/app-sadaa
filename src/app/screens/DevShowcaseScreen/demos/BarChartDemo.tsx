import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { BarChart, Box, Card, Text } from '@/shared/ui';
import { useBarChartDemo } from './hooks/useBarChartDemo';

interface SampleProps {
  label: string;
  children: React.ReactNode;
}

const Sample: React.FC<SampleProps> = memo(({ label, children }) => {
  const { colors } = useTheme();
  return (
    <Card p="lg">
      <Box gap="md">
        <Text variant="caption" color={colors.text.secondary}>
          {label}
        </Text>
        {children}
      </Box>
    </Card>
  );
});

const BarChartDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useBarChartDemo();

  return (
    <Box gap="md">
      <Sample label={t('devShowcase.barChart.earnings')}>
        <BarChart
          data={demo.earnings}
          tone="money"
          highlightLabel={demo.earningsBubble}
          accessibilityLabel={t('devShowcase.barChart.earnings')}
        />
      </Sample>
      <Sample label={t('devShowcase.barChart.spend')}>
        <BarChart
          data={demo.spend}
          highlightLabel={demo.spendBubble}
          accessibilityLabel={t('devShowcase.barChart.spend')}
        />
      </Sample>
      <Sample label={t('devShowcase.barChart.zeros')}>
        <BarChart data={demo.zeros} tone="money" accessibilityLabel={t('devShowcase.barChart.zeros')} />
      </Sample>
      <Sample label={t('devShowcase.barChart.loading')}>
        <BarChart data={[]} loading accessibilityLabel={t('devShowcase.barChart.loading')} />
      </Sample>
    </Box>
  );
};

export const BarChartDemo = memo(BarChartDemoComponent);
