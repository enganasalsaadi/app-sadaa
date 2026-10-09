import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, GradientSurface, MoneyText, Switch, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useMoneyTextDemo } from './hooks/useMoneyTextDemo';
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
  const { colors } = useTheme();
  const demo = useMoneyTextDemo();

  return (
    <Box gap="md">
      <GradientSurface variant="brand" borderRadius="lg" p="lg" gap="xs">
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('devShowcase.moneyText.hero')}
        </Text>
        <MoneyText
          value={MOCK_WALLET.available}
          size="hero"
          tone="onBrand"
          splitFraction
          rounding="down"
          hidden={demo.hidden}
        />
      </GradientSurface>
      <GradientSurface variant="brand" borderRadius="lg" p="lg" gap="xs">
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('devShowcase.moneyText.display')}
        </Text>
        {demo.hidden ? (
          <MoneyText value={MOCK_WALLET.available} size="display" tone="onBrand" hidden />
        ) : (
          <MoneyText
            value={MOCK_WALLET.available}
            size="display"
            tone="onBrand"
            splitFraction
            rounding="down"
            animated
          />
        )}
      </GradientSurface>
      <Row label={t('devShowcase.moneyText.hidden')}>
        <Switch
          value={demo.hidden}
          onValueChange={demo.setHidden}
          accessibilityLabel={t('devShowcase.moneyText.hidden')}
        />
      </Row>
      <MoneyText value={MOCK_WALLET.available} size="lg" tone="money" hidden={demo.hidden} />
      <Row label={t('devShowcase.moneyText.title')}>
        <MoneyText value={MOCK_WALLET.escrow} size="title" tone="money" />
      </Row>
      <Row label={t('devShowcase.moneyText.price')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.budget} />
      </Row>
      <Row label={t('devShowcase.moneyText.small')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.commission} size="sm" tone="muted" />
      </Row>
      <Row label={t('devShowcase.moneyText.earning')}>
        <MoneyText value={MOCK_LEDGER.earning} tone="money" showSign />
      </Row>
      <Row label={t('devShowcase.moneyText.charge')}>
        <MoneyText value={MOCK_LEDGER.charge} showSign />
      </Row>
      <Row label={t('devShowcase.moneyText.cancelled')}>
        <MoneyText value={MOCK_WALLET.cancelled} tone="muted" showSign strikethrough />
      </Row>
      <Row label={t('devShowcase.moneyText.oneDecimal')}>
        <MoneyText value={MOCK_WALLET.oneDecimal} precision={1} />
      </Row>
      <Row label={t('devShowcase.moneyText.wholeDown')}>
        <MoneyText value={MOCK_WALLET.bigUsd} precision={0} rounding="down" />
      </Row>
      <Row label={t('devShowcase.moneyText.compact')}>
        <MoneyText value={MOCK_WALLET.bigUsd} notation="compact" />
      </Row>
      <Row label={t('devShowcase.moneyText.syp')}>
        <MoneyText value={MOCK_WALLET.sypPayout} />
      </Row>
      <Row label={t('devShowcase.moneyText.sypCompact')}>
        <MoneyText value={MOCK_WALLET.sypPayout} notation="compact" />
      </Row>
      <Row label={t('devShowcase.moneyText.code')}>
        <MoneyText value={MOCK_WALLET.available} currencyDisplay="code" />
      </Row>
      <Row label={t('devShowcase.moneyText.none')}>
        <MoneyText value={MOCK_WALLET.available} currencyDisplay="none" />
      </Row>
      <Row label={t('devShowcase.moneyText.estimate')}>
        <MoneyText value={MOCK_DEAL_SUMMARY.payout} estimate />
      </Row>
    </Box>
  );
};

export const MoneyTextDemo = memo(MoneyTextDemoComponent);
