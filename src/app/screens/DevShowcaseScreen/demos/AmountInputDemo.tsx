import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CURRENCY } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { AmountInput, Box, Text } from '@/shared/ui';
import { useAmountInputDemo } from './hooks/useAmountInputDemo';
import { MOCK_DEAL_SUMMARY } from './mockData';

const AmountInputDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const demo = useAmountInputDemo();

  return (
    <Box gap="lg">
      <Box gap="sm">
        <AmountInput
          label={t('devShowcase.amountInput.budgetLabel')}
          placeholder={t('devShowcase.amountInput.placeholder')}
          value={demo.budget}
          onChangeValue={demo.setBudget}
          currency={DEFAULT_CURRENCY}
        />
        <Text variant="caption" color={colors.text.tertiary}>
          {demo.budget
            ? t('devShowcase.amountInput.stored', {
                amount: formatNumber(demo.budget.amount, { useGrouping: false }),
              })
            : t('devShowcase.amountInput.storedEmpty')}
        </Text>
      </Box>
      <AmountInput
        label={t('devShowcase.amountInput.withdrawLabel')}
        placeholder={t('devShowcase.amountInput.placeholder')}
        value={demo.withdraw}
        onChangeValue={demo.setWithdraw}
        currency={DEFAULT_CURRENCY}
        error={t('devShowcase.amountInput.error')}
      />
      <AmountInput
        label={t('devShowcase.amountInput.lockedLabel')}
        value={MOCK_DEAL_SUMMARY.upfront}
        onChangeValue={demo.setWithdraw}
        currency={DEFAULT_CURRENCY}
        editable={false}
      />
    </Box>
  );
};

export const AmountInputDemo = memo(AmountInputDemoComponent);
