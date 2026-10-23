import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, GradientSurface, ProgressBar, ProgressRing, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { ProgressBarTone } from '@/shared/ui';
import { formatMoney, formatNumber } from '@/core/i18n';
import { MOCK_DEAL_SUMMARY } from './mockData';
import { useProgressBarDemo } from './hooks/useProgressBarDemo';

const TONES: ProgressBarTone[] = ['interactive', 'money', 'premium', 'success', 'warning', 'danger'];
const SPENT_RATIO = 0.3;

const ProgressBarDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const demo = useProgressBarDemo();
  const percent = formatNumber(demo.value, { style: 'percent' });

  return (
    <Box gap="lg">
      <ProgressBar
        value={demo.value}
        size="md"
        label={t('devShowcase.progressBar.profile')}
        valueLabel={percent}
        accessibilityLabel={t('devShowcase.progressBar.profile')}
      />
      <ProgressBar
        value={SPENT_RATIO}
        tone="money"
        label={t('devShowcase.progressBar.budget')}
        valueLabel={formatMoney({
          ...MOCK_DEAL_SUMMARY.budget,
          amount: Math.round(MOCK_DEAL_SUMMARY.budget.amount * SPENT_RATIO),
        })}
        accessibilityLabel={t('devShowcase.progressBar.budget')}
      />
      {TONES.map(tone => (
        <ProgressBar
          key={tone}
          value={demo.value}
          tone={tone}
          accessibilityLabel={t('devShowcase.progressBar.profile')}
        />
      ))}
      <GradientSurface variant="brand" borderRadius="lg" p="lg">
        <ProgressBar
          value={demo.value}
          surface="brand"
          label={t('devShowcase.progressBar.profile')}
          valueLabel={percent}
          accessibilityLabel={t('devShowcase.progressBar.profile')}
        />
      </GradientSurface>
      <Box row align="center" gap="lg" accessible accessibilityLabel={t('devShowcase.progressBar.ring')}>
        <ProgressRing
          progress={demo.value}
          size={sizes.vault.tileBadge}
          stroke={sizes.dot.sm / 2}
          color={colors.interactive.main}
          track={colors.border.default}
        />
        <ProgressRing
          progress={demo.value}
          size={sizes.vault.dockRing}
          stroke={sizes.dot.sm / 2}
          color={colors.interactive.main}
          track={colors.border.default}
        >
          <Text variant="overline">{percent}</Text>
        </ProgressRing>
        <ProgressRing
          progress={demo.value}
          size={sizes.illustration.sm}
          stroke={sizes.dot.md}
          color={colors.status.success.main}
          track={colors.border.default}
        >
          <Text variant="amountSmall">{percent}</Text>
        </ProgressRing>
      </Box>
      <CustomButton
        title={t('devShowcase.progressBar.advance')}
        variant="secondary"
        size="sm"
        onPress={demo.advance}
      />
    </Box>
  );
};

export const ProgressBarDemo = memo(ProgressBarDemoComponent);
