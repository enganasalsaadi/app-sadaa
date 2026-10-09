import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  AmountInput,
  Box,
  Card,
  Divider,
  KeyValueRow,
  LayoutFooter,
  MoneyText,
  Notice,
  SegmentedControl,
  Tag,
  Text,
} from '@/shared/ui';
import { TopUpStepLayout } from '../../components/TopUpStepLayout';
import { useTopUpAmountScreen, type TopUpAmountScreenModel } from './hooks/useTopUpAmountScreen';

type Quote = NonNullable<TopUpAmountScreenModel['quote']>;

/** Live quote: sent → rate (pounds) → what the wallet gets, with its estimate caption. */
const QuoteCard = memo<{ quote: Quote }>(({ quote }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Card px="lg" py="sm">
        <Box py="xs">
          <KeyValueRow label={t('finance.topUp.amount.quote.sent')} value={quote.sent} />
        </Box>
        {quote.rate ? (
          <>
            <Divider />
            <Box py="xs">
              <KeyValueRow label={t('finance.topUp.amount.quote.rate')} value={quote.rate} />
            </Box>
          </>
        ) : null}
        {quote.credit ? (
          <>
            <Divider />
            <Box py="xs">
              <KeyValueRow
                label={t('finance.topUp.amount.quote.credit')}
                emphasis="strong"
                value={<MoneyText value={quote.credit} size="title" tone="money" estimate={quote.estimate} />}
              />
            </Box>
          </>
        ) : null}
      </Card>
      <Text variant="caption" color={colors.text.tertiary}>
        {t(quote.estimate ? 'finance.topUp.amount.quote.estimate' : 'finance.topUp.amount.quote.exact')}
      </Text>
    </Box>
  );
});

/** Step 2 of the top-up wizard (Money archetype, amount entry): currency, amount, live quote. */
const TopUpAmountScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useTopUpAmountScreen();

  return (
    <TopUpStepLayout
      step="amount"
      footer={<LayoutFooter primary={{ label: t('finance.topUp.continue'), onPress: vm.onContinue }} />}
    >
      <Box gap="2xl">
        <Box row>
          <Tag label={t('finance.topUp.amount.via', { channel: vm.channelLabel })} />
        </Box>

        {vm.rateChanged ? <Notice tone="warning" message={t('finance.topUp.amount.rateChanged')} /> : null}

        {vm.currencies.length > 1 ? (
          <SegmentedControl
            options={vm.currencies}
            value={vm.currency}
            onChange={vm.onChangeCurrency}
            accessibilityLabel={t('finance.topUp.amount.currencyA11y')}
          />
        ) : null}

        <Box gap="xs">
          <Controller
            control={vm.control}
            name="amount"
            render={({ field, fieldState }) => (
              <AmountInput
                ref={field.ref}
                label={t('finance.topUp.amount.label')}
                value={field.value}
                onChangeValue={field.onChange}
                onBlur={field.onBlur}
                currency={vm.currency}
                error={fieldState.error?.message}
                returnKeyType="done"
                onSubmitEditing={vm.onContinue}
                autoFocus
              />
            )}
          />
          {vm.rangeLabel ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {vm.rangeLabel}
            </Text>
          ) : null}
        </Box>

        {vm.quote ? <QuoteCard quote={vm.quote} /> : null}
      </Box>
    </TopUpStepLayout>
  );
};

export const TopUpAmountScreen = memo(TopUpAmountScreenComponent);
