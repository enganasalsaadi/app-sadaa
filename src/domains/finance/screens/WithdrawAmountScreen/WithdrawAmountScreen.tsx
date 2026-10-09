import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  AmountInput,
  Box,
  Chip,
  ErrorState,
  LayoutFooter,
  MoneyText,
  Notice,
  SegmentedControl,
  Text,
} from '@/shared/ui';
import { PayoutChannelSheet } from '../../components/PayoutChannelSheet';
import { WithdrawMethodSheet } from '../../components/WithdrawMethodSheet';
import { WithdrawStepLayout } from '../../components/WithdrawStepLayout';
import {
  AddMethodCard,
  AmountSkeleton,
  BlockedNotice,
  DestinationCard,
  QuoteCard,
} from './components/WithdrawAmountParts';
import { useWithdrawAmountScreen } from './hooks/useWithdrawAmountScreen';

const USE_ALL = 'all';

/** Step 1 of the withdraw wizard (Money archetype, amount entry): destination, amount, live quote. */
const WithdrawAmountScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useWithdrawAmountScreen();
  const ready = vm.loadStatus === 'ready';

  const footer = ready ? (
    <LayoutFooter
      top={
        <Text variant="caption" color={colors.text.tertiary} align="center">
          {t(
            vm.blocked
              ? 'finance.withdraw.amount.blockedCaption'
              : 'finance.withdraw.amount.timing',
          )}
        </Text>
      }
      primary={{
        label: t('finance.withdraw.continue'),
        onPress: vm.onContinue,
        disabled: vm.blocked,
        loading: vm.continueLoading,
      }}
    />
  ) : undefined;

  return (
    <WithdrawStepLayout step="amount" footer={footer}>
      {vm.loadStatus === 'loading' ? <AmountSkeleton /> : null}
      {vm.loadStatus === 'error' ? <ErrorState onRetry={vm.retryLoad} /> : null}
      {ready ? (
        <Box gap="2xl">
          {vm.methodView ? (
            <DestinationCard
              view={vm.methodView}
              onChange={vm.openMethodSheet}
            />
          ) : (
            <Controller
              control={vm.control}
              name="payoutMethodId"
              render={({ fieldState }) => (
                <AddMethodCard
                  onAdd={vm.openChannelSheet}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          {vm.currencies.length > 1 ? (
            <SegmentedControl
              options={vm.currencies}
              value={vm.currency}
              onChange={vm.onChangeCurrency}
              accessibilityLabel={t('finance.withdraw.amount.currencyA11y')}
            />
          ) : null}

          <Box gap="sm">
            <Controller
              control={vm.control}
              name="amount"
              render={({ field, fieldState }) => (
                <AmountInput
                  ref={field.ref}
                  label={t('finance.withdraw.amount.label')}
                  value={field.value}
                  onChangeValue={field.onChange}
                  onBlur={field.onBlur}
                  currency={vm.available?.currency ?? 'USD'}
                  error={fieldState.error?.message}
                  returnKeyType="done"
                  onSubmitEditing={vm.onContinue}
                  autoFocus={vm.hasMethods}
                />
              )}
            />
            {vm.available ? (
              <Box row align="center" justify="space-between" gap="md">
                <Box row align="center" gap="xs" flex={1}>
                  <Text variant="caption" color={colors.text.secondary}>
                    {t('finance.withdraw.amount.available')}
                  </Text>
                  <MoneyText
                    value={vm.available}
                    size="sm"
                    tone="money"
                    rounding="down"
                  />
                </Box>
                <Chip
                  label={t('finance.withdraw.amount.useAll')}
                  value={USE_ALL}
                  onSelect={vm.useAll}
                  disabled={vm.available.amount <= 0}
                />
              </Box>
            ) : null}
            <Text variant="caption" color={colors.text.tertiary}>
              {vm.limitsLabel}
            </Text>
          </Box>

          {vm.blocked ? (
            <BlockedNotice
              reasons={vm.reasons}
              nextAllowedMs={vm.nextAllowedMs}
            />
          ) : null}

          {vm.quoteError ? (
            <Notice
              tone="danger"
              message={t('finance.withdraw.amount.quoteFailed')}
              action={{ label: t('common.retry'), onPress: vm.retryQuote }}
            />
          ) : null}

          {vm.quoteView ? (
            <QuoteCard quote={vm.quoteView} dimmed={vm.quoteDimmed} />
          ) : null}
        </Box>
      ) : null}

      <WithdrawMethodSheet
        visible={vm.methodSheetVisible}
        onClose={vm.closeMethodSheet}
        views={vm.views}
        selectedId={vm.methodView?.id ?? null}
        onPick={vm.pickMethod}
        onAdd={vm.openChannelSheet}
      />
      <PayoutChannelSheet
        visible={vm.channelSheetVisible}
        onClose={vm.closeChannelSheet}
        onPick={vm.pickChannel}
      />
    </WithdrawStepLayout>
  );
};

export const WithdrawAmountScreen = memo(WithdrawAmountScreenComponent);
