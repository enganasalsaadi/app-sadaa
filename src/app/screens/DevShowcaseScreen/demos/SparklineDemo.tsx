import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Sparkline, Text } from '@/shared/ui';
import { MOCK_DAILY_EARNINGS, MOCK_DAILY_VIEWS } from './mockData';

const FLAT_ZEROS: readonly number[] = [0, 0, 0, 0, 0, 0, 0];
const SINGLE: readonly number[] = [14];

interface SampleProps {
  label: string;
  children: React.ReactNode;
}

const Sample: React.FC<SampleProps> = memo(({ label, children }) => {
  const { colors } = useTheme();
  return (
    <Card p="md">
      <Box gap="sm">
        <Text variant="caption" color={colors.text.secondary}>
          {label}
        </Text>
        {children}
      </Box>
    </Card>
  );
});

const SparklineDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="md">
      <Sample label={t('devShowcase.sparkline.views')}>
        <Sparkline
          values={MOCK_DAILY_VIEWS}
          accessibilityLabel={t('devShowcase.sparkline.views')}
        />
      </Sample>
      <Sample label={t('devShowcase.sparkline.earnings')}>
        <Sparkline
          values={MOCK_DAILY_EARNINGS}
          tone="money"
          accessibilityLabel={t('devShowcase.sparkline.earnings')}
        />
      </Sample>
      <Sample label={t('devShowcase.sparkline.zeros')}>
        <Sparkline
          values={FLAT_ZEROS}
          accessibilityLabel={t('devShowcase.sparkline.zeros')}
        />
      </Sample>
      <Sample label={t('devShowcase.sparkline.single')}>
        <Sparkline
          values={SINGLE}
          accessibilityLabel={t('devShowcase.sparkline.single')}
        />
      </Sample>
      <Sample label={t('devShowcase.sparkline.loading')}>
        <Sparkline
          values={[]}
          loading
          accessibilityLabel={t('devShowcase.sparkline.loading')}
        />
      </Sample>
    </Box>
  );
};

export const SparklineDemo = memo(SparklineDemoComponent);
