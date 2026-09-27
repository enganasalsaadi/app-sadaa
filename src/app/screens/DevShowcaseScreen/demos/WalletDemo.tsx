import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader } from '@/shared/ui';
import { BalanceCard, PaymentBreakdown } from '@/domains/finance';
import type { PaymentLine } from '@/domains/finance';
import { useWalletDemo } from './hooks/useWalletDemo';
import { MOCK_DEAL_SUMMARY, MOCK_WALLET } from './mockData';

const WalletDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useWalletDemo();

  const lines = useMemo<PaymentLine[]>(
    () => [
      { key: 'price', label: t('devShowcase.wallet.price'), value: MOCK_DEAL_SUMMARY.budget },
      {
        key: 'fee',
        label: t('devShowcase.wallet.fee'),
        hint: t('devShowcase.structure.commissionHint'),
        value: MOCK_DEAL_SUMMARY.commission,
      },
    ],
    [t],
  );
  const total = useMemo(
    () => ({ label: t('devShowcase.wallet.total'), value: MOCK_DEAL_SUMMARY.payout }),
    [t],
  );

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.wallet.creatorTitle')} />
        <BalanceCard
          role="creator"
          available={MOCK_WALLET.available}
          escrow={MOCK_WALLET.escrow}
          pending={MOCK_WALLET.pending}
          onAction={demo.onWithdraw}
          actionLoading={demo.withdrawing}
        />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.wallet.brandTitle')} />
        <BalanceCard role="brand" available={MOCK_WALLET.escrow} onAction={demo.onDeposit} />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.wallet.breakdownTitle')} />
        <PaymentBreakdown lines={lines} total={total} />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.wallet.estimateTitle')} />
        <PaymentBreakdown lines={lines} total={total} estimate />
      </Box>
    </Box>
  );
};

export const WalletDemo = memo(WalletDemoComponent);
