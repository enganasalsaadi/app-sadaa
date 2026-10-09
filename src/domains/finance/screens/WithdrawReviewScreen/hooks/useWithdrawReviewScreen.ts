import { useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError, type AppApiError } from '@/core/api';
import { formatMoney } from '@/core/i18n';
import type { WithdrawStackScreenProps } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { useCreateWithdrawalMutation } from '../../../api/withdrawalApi';
import type { ReviewSectionRow } from '../../../components/ReviewSection';
import { useWithdrawFlow } from '../../../hooks/useWithdrawFlow';
import type { WithdrawFormValues } from '../../../schemas/withdrawSchema';
import { exchangeRateLine } from '../../../utils/exchangeRateText';
import { maskTail } from '../../../utils/payoutMethodForm';
import { parseWithdrawalBlock } from '../../../utils/withdrawalMappers';

type Navigation = WithdrawStackScreenProps<'WithdrawReview'>['navigation'];
type FormField = keyof WithdrawFormValues;

type ReviewRow = ReviewSectionRow;

/** 422 `errors` keys → form fields (handoff §8 body). */
const SERVER_FIELDS = {
  payout_method_id: 'payoutMethodId',
  amount_cents: 'amount',
  payout_currency: 'currency',
} as const satisfies Record<string, FormField>;

/**
 * Step 2: what arrives where, with an edit link per section, then the one money POST of
 * the flow (rule 06): one idempotency key for the whole wizard, never retried by itself.
 * A server block goes back to the amount step, which lists the reasons; a blocked
 * wallet leaves the flow (the wallet hero explains why).
 */
export const useWithdrawReviewScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const toast = useToast();
  const flow = useWithdrawFlow();
  const { control, handleSubmit, setError } = useFormContext<WithdrawFormValues>();
  const amount = useWatch({ control, name: 'amount' });
  const [createWithdrawal, { isLoading }] = useCreateWithdrawalMutation();
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const { method, methodView, quote } = flow;

  const payout = quote?.net_payout ?? quote?.net ?? null;
  const converted = !!quote?.net && !!quote.net_payout && quote.net_payout.currency !== quote.net.currency;

  const head = useMemo(() => {
    if (!payout) return null;
    const fee = quote?.fee ? formatMoney(quote.fee, lang) : null;
    const net = quote?.net ? formatMoney(quote.net, lang) : null;
    return {
      title: t('finance.withdraw.review.receiveOn', { channel: methodView?.channelName ?? '' }),
      payout,
      caption:
        converted && net && fee
          ? t('finance.withdraw.review.netAfterFee', { net, fee })
          : fee
            ? t('finance.withdraw.review.afterFee', { fee })
            : null,
    };
  }, [converted, lang, methodView?.channelName, payout, quote?.fee, quote?.net, t]);

  const destinationRows = useMemo<ReviewRow[]>(() => {
    if (!method || !methodView) return [];
    const rows: ReviewRow[] = [{ key: 'method', label: t('finance.withdraw.review.method'), value: methodView.title }];
    if (method.details.holder_name) {
      rows.push({ key: 'holder', label: t('finance.withdraw.review.holder'), value: method.details.holder_name });
    }
    const account = maskTail(method.details.account_number);
    const phone = maskTail(method.details.phone);
    if (account) rows.push({ key: 'account', label: t('finance.withdraw.review.account'), value: account });
    else if (phone) rows.push({ key: 'phone', label: t('finance.withdraw.review.phone'), value: phone });
    return rows;
  }, [method, methodView, t]);

  const amountRows = useMemo<ReviewRow[]>(() => {
    const rows: ReviewRow[] = [];
    const gross = quote?.gross ?? amount;
    if (gross) rows.push({ key: 'gross', label: t('finance.withdraw.review.gross'), value: formatMoney(gross, lang) });
    if (quote?.fee) rows.push({ key: 'fee', label: t('finance.withdraw.review.fee'), value: formatMoney(quote.fee, lang) });
    if (quote?.net) rows.push({ key: 'net', label: t('finance.withdraw.review.net'), value: formatMoney(quote.net, lang) });
    const rate =
      converted && quote?.net && quote.net_payout && quote.exchange_rate
        ? exchangeRateLine(quote.exchange_rate, quote.net.currency, quote.net_payout.currency, lang, t)
        : null;
    if (rate) rows.push({ key: 'rate', label: t('finance.withdraw.review.rate'), value: rate });
    return rows;
  }, [amount, converted, lang, quote, t]);

  const editDestination = useCallback(() => navigation.popTo('WithdrawAmount'), [navigation]);
  const editAmount = useCallback(() => navigation.popTo('WithdrawAmount'), [navigation]);

  const { action, setSubmitBlock, retryQuote, exitToWallet, finish } = flow;

  const handleFailure = useCallback(
    (err: unknown) => {
      const error = normalizeApiError(err);
      const block = parseWithdrawalBlock(error);
      if (block) {
        setSubmitBlock(block);
        retryQuote();
        navigation.popTo('WithdrawAmount');
        return;
      }
      switch (error.code) {
        case 'kyc_required':
        case 'wallet_frozen':
        case 'wallet_closed':
          toast.warning(t('finance.withdraw.review.blocked'));
          exitToWallet();
          return;
        case 'fx_rate_stale':
        case 'fx_rate_unavailable':
        case 'currency_not_supported':
          // The fresh quote names the problem on the amount step.
          retryQuote();
          navigation.popTo('WithdrawAmount');
          return;
        default:
          break;
      }
      const mapped = applyServerFieldErrors(err, SERVER_FIELDS, (field, fieldError) => setError(field, fieldError));
      if (mapped) {
        navigation.popTo('WithdrawAmount');
        return;
      }
      setApiError(error);
    },
    [exitToWallet, navigation, retryQuote, setError, setSubmitBlock, t, toast],
  );

  const onInvalid = useCallback(
    (_errors: FieldErrors<WithdrawFormValues>) => navigation.popTo('WithdrawAmount'),
    [navigation],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading || !values.payoutMethodId || !values.amount) return;
      setApiError(null);
      const body = {
        payout_method_id: values.payoutMethodId,
        amount_cents: values.amount.amount,
        payout_currency: values.currency,
      };
      try {
        const withdrawal = await action.run(idempotencyKey => createWithdrawal({ body, idempotencyKey }).unwrap());
        finish(withdrawal.id);
      } catch (err) {
        handleFailure(err);
      }
    }, onInvalid)();
  }, [action, createWithdrawal, finish, handleFailure, handleSubmit, isLoading, onInvalid]);

  return {
    head,
    estimate: converted,
    destinationRows,
    amountRows,
    editDestination,
    editAmount,
    apiError,
    isSubmitting: isLoading,
    onSubmit,
  };
};

export type WithdrawReviewScreenModel = ReturnType<typeof useWithdrawReviewScreen>;
