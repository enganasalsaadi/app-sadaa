import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { formatMoney, formatNumber } from '@/core/i18n';
import type { CurrencyCode } from '@/core/money';
import type { WithdrawStackScreenProps } from '@/core/navigation';
import type { SegmentedOption } from '@/shared/ui';
import { WITHDRAW_LIMITS } from '../../../constants/withdraw';
import { useWithdrawFlow } from '../../../hooks/useWithdrawFlow';
import { WITHDRAW_STEP_FIELDS, type WithdrawFormValues } from '../../../schemas/withdrawSchema';
import type { PaymentChannel } from '../../../types';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';
import { formatReasonLabel } from '../../../utils/withdrawalView';

type Navigation = WithdrawStackScreenProps<'WithdrawAmount'>['navigation'];

const SEGMENT_LABEL = {
  USD: 'finance.withdraw.amount.segmentUsd',
  SYP: 'finance.withdraw.amount.segmentSyp',
} as const;

const WHOLE = { precision: 0 } as const;
/** `setTimeout` can't wait longer (≈ 24.8 days); a cooldown is 7. */
const MAX_TIMER_MS = 2_147_483_647;

/**
 * Step 1: where the money goes (the primary method, or another one from the sheet), the
 * payout currency when the method takes both, the amount from the balance and the live
 * quote. A blocked quote lists every reason and keeps Continue disabled; a cooldown
 * counts down and asks again when it ends.
 */
export const useWithdrawAmountScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const flow = useWithdrawFlow();
  const { control, setValue, trigger } = useFormContext<WithdrawFormValues>();
  const currency = useWatch({ control, name: 'currency' });
  const { available, method, methodView, quote, quoteStatus, blocked, blockReasons, nextAllowedAt } = flow;

  const [methodSheetVisible, setMethodSheetVisible] = useState(false);
  const [channelSheetVisible, setChannelSheetVisible] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const currencies = useMemo<SegmentedOption<CurrencyCode>[]>(
    () => (method?.currencies ?? []).map(value => ({ value, label: t(SEGMENT_LABEL[value]) })),
    [method?.currencies, t],
  );

  const onChangeCurrency = useCallback(
    (value: CurrencyCode) => setValue('currency', value, { shouldDirty: true }),
    [setValue],
  );

  const useAll = useCallback(() => {
    if (available) setValue('amount', available, { shouldDirty: true, shouldValidate: true });
  }, [available, setValue]);

  const limitsLabel = useMemo(
    () =>
      t('finance.withdraw.amount.limits', {
        min: formatMoney({ amount: WITHDRAW_LIMITS.min, currency: 'USD' }, lang, WHOLE),
        max: formatMoney({ amount: WITHDRAW_LIMITS.dailyMax, currency: 'USD' }, lang, WHOLE),
        days: formatNumber(WITHDRAW_LIMITS.cooldownDays, {}, lang),
      }),
    [lang, t],
  );

  const reasons = useMemo(() => blockReasons.map(reason => formatReasonLabel(reason, t)), [blockReasons, t]);

  const nextAllowedMs = useMemo(() => {
    if (!nextAllowedAt) return null;
    const ms = new Date(nextAllowedAt).getTime();
    return Number.isNaN(ms) || ms <= Date.now() ? null : ms;
  }, [nextAllowedAt]);

  // The cooldown ends while the screen is open: ask again so the block clears by itself.
  const { retryQuote } = flow;
  useEffect(() => {
    if (nextAllowedMs === null) return;
    const delay = nextAllowedMs - Date.now();
    if (delay > MAX_TIMER_MS) return;
    const id = setTimeout(retryQuote, Math.max(0, delay));
    return () => clearTimeout(id);
  }, [nextAllowedMs, retryQuote]);

  const quoteView = useMemo(() => {
    if (!quote?.gross || !quote.net) return null;
    const payout = quote.net_payout && quote.net_payout.currency !== quote.net.currency ? quote.net_payout : null;
    const sides =
      payout && quote.exchange_rate
        ? formatExchangeRateSides(quote.exchange_rate, quote.net.currency, payout.currency, lang)
        : null;
    return {
      gross: formatMoney(quote.gross, lang),
      fee: quote.fee ? formatMoney(quote.fee, lang) : null,
      feeLabel: t('finance.withdraw.amount.quote.fee', { channel: methodView?.channelName ?? '' }),
      net: quote.net,
      payout,
      rateCaption: sides ? t('finance.withdraw.amount.quote.rate', { rate: t('finance.wallet.rate.value', sides) }) : null,
    };
  }, [lang, methodView?.channelName, quote, t]);

  const navigateToReview = useCallback(() => navigation.navigate('WithdrawReview'), [navigation]);

  // Continue pressed while the quote was still on its way: go on once it says yes.
  useEffect(() => {
    if (!waiting) return;
    if (quoteStatus === 'ready') {
      setWaiting(false);
      if (!blocked) navigateToReview();
    } else if (quoteStatus === 'error' || quoteStatus === 'idle') {
      setWaiting(false);
    }
  }, [blocked, navigateToReview, quoteStatus, waiting]);

  const onContinue = useCallback(async () => {
    const valid = await trigger(WITHDRAW_STEP_FIELDS.amount);
    if (!valid) return;
    switch (quoteStatus) {
      case 'ready':
        if (!blocked) navigateToReview();
        return;
      case 'error':
        retryQuote();
        setWaiting(true);
        return;
      case 'loading':
        setWaiting(true);
        return;
      case 'idle':
        return;
      default: {
        const _exhaustive: never = quoteStatus;
        return _exhaustive;
      }
    }
  }, [blocked, navigateToReview, quoteStatus, retryQuote, trigger]);

  const openMethodSheet = useCallback(() => setMethodSheetVisible(true), []);
  const closeMethodSheet = useCallback(() => setMethodSheetVisible(false), []);
  const pickMethod = useCallback(
    (id: string) => setValue('payoutMethodId', id, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const openChannelSheet = useCallback(() => setChannelSheetVisible(true), []);
  const closeChannelSheet = useCallback(() => setChannelSheetVisible(false), []);
  const { addMethod } = flow;
  const pickChannel = useCallback((channel: PaymentChannel) => addMethod(channel), [addMethod]);

  return {
    control,
    loadStatus: flow.loadStatus,
    retryLoad: flow.retryLoad,
    methodView,
    hasMethods: flow.views.length > 0,
    views: flow.views,
    currency,
    currencies,
    onChangeCurrency,
    available,
    useAll,
    limitsLabel,
    blocked,
    reasons,
    nextAllowedMs,
    quoteView,
    quoteDimmed: quoteStatus === 'loading',
    quoteError: quoteStatus === 'error' && !waiting,
    retryQuote,
    continueLoading: waiting,
    onContinue,
    methodSheetVisible,
    openMethodSheet,
    closeMethodSheet,
    pickMethod,
    channelSheetVisible,
    openChannelSheet,
    closeChannelSheet,
    pickChannel,
  };
};

export type WithdrawAmountScreenModel = ReturnType<typeof useWithdrawAmountScreen>;
