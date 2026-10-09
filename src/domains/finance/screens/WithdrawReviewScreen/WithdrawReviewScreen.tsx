import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, InlineError, LayoutFooter, MoneyText, Text } from '@/shared/ui';
import { ReviewSection } from '../../components/ReviewSection';
import { WithdrawStepLayout } from '../../components/WithdrawStepLayout';
import { useWithdrawReviewScreen } from './hooks/useWithdrawReviewScreen';

/** Step 2 of the withdraw wizard: what arrives where, the destination, the amounts, send. */
const WithdrawReviewScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useWithdrawReviewScreen();

  return (
    <WithdrawStepLayout
      step="review"
      footer={
        <LayoutFooter
          top={
            <Text variant="caption" color={colors.text.tertiary} align="center">
              {t('finance.withdraw.review.caption')}
            </Text>
          }
          primary={{ label: t('finance.withdraw.review.submit'), onPress: vm.onSubmit, loading: vm.isSubmitting }}
        />
      }
    >
      <Box gap="2xl">
        {vm.head ? (
          <Box align="center" gap="xs" pt="md">
            <Text variant="bodySmall" color={colors.text.secondary}>
              {vm.head.title}
            </Text>
            <MoneyText value={vm.head.payout} size="lg" tone="money" estimate={vm.estimate} />
            {vm.head.caption ? (
              <Text variant="caption" color={colors.text.tertiary}>
                {vm.head.caption}
              </Text>
            ) : null}
          </Box>
        ) : null}

        <ReviewSection
          title={t('finance.withdraw.review.destinationSection')}
          rows={vm.destinationRows}
          onEdit={vm.editDestination}
        />
        <ReviewSection title={t('finance.withdraw.review.amountSection')} rows={vm.amountRows} onEdit={vm.editAmount} />

        {vm.apiError ? <InlineError error={vm.apiError} /> : null}
      </Box>
    </WithdrawStepLayout>
  );
};

export const WithdrawReviewScreen = memo(WithdrawReviewScreenComponent);
