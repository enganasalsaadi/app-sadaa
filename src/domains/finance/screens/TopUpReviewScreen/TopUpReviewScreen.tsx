import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, InlineError, LayoutFooter, MoneyText, Text } from '@/shared/ui';
import { ReviewSection } from '../../components/ReviewSection';
import { TopUpStepLayout } from '../../components/TopUpStepLayout';
import { useTopUpReviewScreen } from './hooks/useTopUpReviewScreen';

/** Step 4 of the top-up wizard: what the wallet gets, the transfer, the proof, send. */
const TopUpReviewScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useTopUpReviewScreen();

  return (
    <TopUpStepLayout
      step="review"
      footer={
        <LayoutFooter
          top={
            <Text variant="caption" color={colors.text.tertiary} align="center">
              {t('finance.topUp.review.caption')}
            </Text>
          }
          primary={{ label: t('finance.topUp.review.submit'), onPress: vm.onSubmit, loading: vm.isSubmitting }}
        />
      }
    >
      <Box gap="2xl">
        {vm.credit ? (
          <Box align="center" gap="xs" pt="md">
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t(vm.estimate ? 'finance.topUp.review.creditEstimate' : 'finance.topUp.review.creditExact')}
            </Text>
            <MoneyText value={vm.credit} size="lg" tone="money" estimate={vm.estimate} />
            {vm.against ? (
              <Text variant="caption" color={colors.text.tertiary}>
                {vm.against}
              </Text>
            ) : null}
          </Box>
        ) : null}

        <ReviewSection title={t('finance.topUp.review.transferSection')} rows={vm.transferRows} onEdit={vm.editTransfer} />
        <ReviewSection title={t('finance.topUp.review.proofSection')} rows={vm.proofRows} onEdit={vm.editProof} />

        {vm.apiError ? <InlineError error={vm.apiError} /> : null}
      </Box>
    </TopUpStepLayout>
  );
};

export const TopUpReviewScreen = memo(TopUpReviewScreenComponent);
