import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  Divider,
  InlineError,
  KeyValueRow,
  LayoutFooter,
  MoneyText,
  Pressable,
  Text,
} from '@/shared/ui';
import { TopUpStepLayout } from '../../components/TopUpStepLayout';
import { useTopUpReviewScreen, type ReviewRow } from './hooks/useTopUpReviewScreen';

const ReviewSection = memo<{ title: string; rows: readonly ReviewRow[]; onEdit: () => void }>(
  ({ title, rows, onEdit }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    return (
      <Box gap="sm">
        <Box row align="center" justify="space-between">
          <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
            {title}
          </Text>
          <Pressable
            onPress={onEdit}
            minHeight={sizes.button.sm}
            justify="center"
            px="xs"
            accessibilityRole="link"
            accessibilityLabel={t('finance.topUp.review.editA11y', { section: title })}
          >
            <Text variant="bodyMedium" color={colors.interactive.text}>
              {t('finance.topUp.review.edit')}
            </Text>
          </Pressable>
        </Box>
        <Card px="lg" py="sm">
          {rows.map((row, index) => (
            <Box key={row.key}>
              {index > 0 ? <Divider /> : null}
              <Box py="xs">
                <KeyValueRow label={row.label} value={row.value} />
              </Box>
            </Box>
          ))}
        </Card>
      </Box>
    );
  },
);

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
