import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, MoneyText, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { MOCK_DEAL_SUMMARY, MOCK_LEDGER, MOCK_WALLET } from './mockData';

const Row = memo<{ label: string; children: React.ReactNode }>(({ label, children }) => {
  const { colors } = useTheme();
  return (
    <Box row align="center" justify="space-between" gap="md">
      <Text variant="bodySmall" color={colors.text.secondary}>
        {label}
      </Text>
      {children}
    </Box>
  );
});

const MoneyTextDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="md">
      <MoneyText value={MOCK_WALLET.available} size="lg" tone="money" />
      <Row label={t('devShowcase.moneyText.price')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.budget} />
      </Row>
      <Row label={t('devShowcase.moneyText.muted')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.commission} tone="muted" />
      </Row>
      <Row label={t('devShowcase.moneyText.earning')}>
        <MoneyText value={MOCK_LEDGER.earning} tone="money" showSign />
      </Row>
      <Row label={t('devShowcase.moneyText.charge')}>
        <MoneyText value={MOCK_LEDGER.charge} showSign />
      </Row>
      <Row label={t('devShowcase.moneyText.estimate')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.payout} estimate />
      </Row>
    </Box>
  );
};

export const MoneyTextDemo = memo(MoneyTextDemoComponent);
