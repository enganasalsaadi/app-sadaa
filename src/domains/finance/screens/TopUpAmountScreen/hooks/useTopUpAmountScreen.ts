import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { formatMoney } from '@/core/i18n';
import type { CurrencyCode } from '@/core/money';
import type { TopUpStackScreenProps } from '@/core/navigation';
import type { SegmentedOption } from '@/shared/ui';
import { useTopUpFlow } from '../../../hooks/useTopUpFlow';
import { TOP_UP_STEP_FIELDS, type TopUpFormValues } from '../../../schemas/topUpSchema';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';
import { fallbackLimits } from '../../../utils/topUpEstimate';

type Navigation = TopUpStackScreenProps<'TopUpAmount'>['navigation'];

const SEGMENT_LABEL = {
  USD: 'finance.topUp.amount.segmentUsd',
  SYP: 'finance.topUp.amount.segmentSyp',
} as const;

const WHOLE = { precision: 0 } as const;

/**
 * Step 2: the currency (only those the channel takes right now) and the amount, checked
 * against the channel's range. The quote card shows what the wallet gets: the amount
 * itself for dollars, a labelled estimate at today's rate for pounds (rule 06).
 */
export const useTopUpAmountScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const flow = useTopUpFlow();
  const { control, setValue, trigger } = useFormContext<TopUpFormValues>();
  const currency = useWatch({ control, name: 'currency' });
  const amount = useWatch({ control, name: 'amount' });
  const { selected, limits, rate, credit } = flow;

  const currencies = useMemo<SegmentedOption<CurrencyCode>[]>(
    () => (selected?.currencies ?? []).map(value => ({ value, label: t(SEGMENT_LABEL[value]) })),
    [selected?.currencies, t],
  );

  const onChangeCurrency = useCallback(
    (value: CurrencyCode) => {
      if (value === currency) return;
      setValue('currency', value, { shouldDirty: true });
      // An amount typed in the other currency means nothing in this one.
      setValue('amount', null, { shouldDirty: true });
    },
    [currency, setValue],
  );

  const rangeLabel = useMemo(() => {
    if (!limits) return null;
    const min = formatMoney(limits.min, lang, WHOLE);
    const max = formatMoney(limits.max, lang, WHOLE);
    if (currency === 'USD') return t('finance.topUp.amount.range', { min, max });
    const usd = selected?.limits.USD ?? fallbackLimits('USD', null);
    if (!usd) return t('finance.topUp.amount.range', { min, max });
    return t('finance.topUp.amount.rangeWithUsd', {
      min,
      max,
      usd: t('finance.topUp.amount.usdSpan', {
        min: formatMoney(usd.min, lang, WHOLE),
        max: formatMoney(usd.max, lang, WHOLE),
      }),
    });
  }, [currency, lang, limits, selected?.limits.USD, t]);

  const rateLabel = useMemo(() => {
    if (currency !== 'SYP' || !rate) return null;
    const sides = formatExchangeRateSides(rate, 'USD', 'SYP', lang);
    return sides ? t('finance.wallet.rate.value', sides) : null;
  }, [currency, lang, rate, t]);

  const quote = useMemo(() => {
    if (!amount || amount.amount <= 0 || amount.currency !== currency) return null;
    return {
      sent: formatMoney(amount, lang),
      rate: rateLabel,
      credit,
      estimate: currency !== 'USD',
    };
  }, [amount, credit, currency, lang, rateLabel]);

  const { setNotice } = flow;
  const onContinue = useCallback(async () => {
    const valid = await trigger(TOP_UP_STEP_FIELDS.amount);
    if (!valid) return;
    setNotice(null);
    navigation.navigate('TopUpTransfer');
  }, [navigation, setNotice, trigger]);

  return {
    control,
    channelLabel: selected?.label ?? '',
    currency,
    currencies,
    onChangeCurrency,
    rangeLabel,
    quote,
    rateChanged: flow.notice === 'rateChanged',
    onContinue,
  };
};

export type TopUpAmountScreenModel = ReturnType<typeof useTopUpAmountScreen>;
