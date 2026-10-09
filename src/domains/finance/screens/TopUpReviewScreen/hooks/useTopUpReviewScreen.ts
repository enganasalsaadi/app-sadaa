import { useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError, type AppApiError } from '@/core/api';
import { formatMoney } from '@/core/i18n';
import type { TopUpStackParamList, TopUpStackScreenProps } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { toFormDataFile } from '@/domains/auth';
import { useCreateTopUpMutation } from '../../../api/topUpApi';
import { useTopUpFlow } from '../../../hooks/useTopUpFlow';
import type { TopUpFormValues } from '../../../schemas/topUpSchema';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';

type Navigation = TopUpStackScreenProps<'TopUpReview'>['navigation'];
type StepRoute = Exclude<keyof TopUpStackParamList, 'TopUpReview'>;
type FormField = keyof TopUpFormValues;

export interface ReviewRow {
  key: string;
  label: string;
  value: string;
}

/** 422 `errors` keys → form fields (top-ups v2 §3). */
const SERVER_FIELDS = {
  channel: 'channel',
  currency: 'currency',
  amount: 'amount',
  transfer_reference: 'transferReference',
  receipt: 'receipt',
} as const satisfies Record<string, FormField>;

/** The step that owns a field, in wizard order (the first one wins). */
const FIELD_STEP = {
  channel: 'TopUpChannel',
  currency: 'TopUpAmount',
  amount: 'TopUpAmount',
  transferReference: 'TopUpTransfer',
  receipt: 'TopUpTransfer',
} as const satisfies Record<FormField, StepRoute>;

const STEP_ORDER: readonly StepRoute[] = ['TopUpChannel', 'TopUpAmount', 'TopUpTransfer'];

const firstStep = (fields: readonly FormField[]): StepRoute | null =>
  STEP_ORDER.find(step => fields.some(field => FIELD_STEP[field] === step)) ?? null;

/**
 * Step 4: the summary with an edit link per section, then the one money POST of the
 * flow (rule 06): one idempotency key for the whole wizard, never retried by itself.
 * A rejection goes back to the step that can fix it; a blocked wallet leaves the flow
 * (the wallet hero explains why).
 */
export const useTopUpReviewScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const toast = useToast();
  const flow = useTopUpFlow();
  const { control, handleSubmit, setError } = useFormContext<TopUpFormValues>();
  const [amount, transferReference, receipt] = useWatch({
    control,
    name: ['amount', 'transferReference', 'receipt'],
  });
  const [createTopUp, { isLoading }] = useCreateTopUpMutation();
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const { selected, rate, credit } = flow;

  const isSyp = amount?.currency === 'SYP';

  const transferRows = useMemo<ReviewRow[]>(() => {
    const rows: ReviewRow[] = [];
    if (selected) rows.push({ key: 'method', label: t('finance.topUp.review.method'), value: selected.label });
    if (amount) rows.push({ key: 'sent', label: t('finance.topUp.review.sent'), value: formatMoney(amount, lang) });
    const sides = isSyp && rate ? formatExchangeRateSides(rate, 'USD', 'SYP', lang) : null;
    if (sides) rows.push({ key: 'rate', label: t('finance.topUp.review.rate'), value: t('finance.wallet.rate.value', sides) });
    return rows;
  }, [amount, isSyp, lang, rate, selected, t]);

  const proofRows = useMemo<ReviewRow[]>(() => {
    const rows: ReviewRow[] = [
      { key: 'reference', label: t('finance.topUp.review.reference'), value: transferReference.trim() },
    ];
    if (receipt) rows.push({ key: 'receipt', label: t('finance.topUp.review.receipt'), value: receipt.name });
    return rows;
  }, [receipt, t, transferReference]);

  const editTransfer = useCallback(() => navigation.popTo('TopUpAmount'), [navigation]);
  const editProof = useCallback(() => navigation.popTo('TopUpTransfer'), [navigation]);

  const { action, refetchChannels, setNotice, exitToWallet, exitToPending, finish } = flow;

  const handleFailure = useCallback(
    (err: unknown) => {
      const error = normalizeApiError(err);
      switch (error.code) {
        case 'fx_rate_stale':
        case 'fx_rate_unavailable':
          refetchChannels();
          setNotice('rateChanged');
          navigation.popTo('TopUpAmount');
          return;
        case 'channel_paused':
          refetchChannels();
          setNotice('channelPaused');
          navigation.popTo('TopUpChannel');
          return;
        case 'kyc_required':
        case 'wallet_frozen':
        case 'wallet_closed':
          toast.warning(t('finance.topUp.review.blocked'));
          exitToWallet();
          return;
        case 'top_up_pending_limit':
          // Nothing to fix in the form: only a review frees a slot.
          toast.warning(t('finance.topUp.review.pendingLimit'));
          exitToPending();
          return;
        case 'top_up_amount_out_of_range':
          // The advertised range moved with the rate: the amount step shows the new one.
          refetchChannels();
          break;
        default:
          break;
      }

      const touched: FormField[] = [];
      const mapped = applyServerFieldErrors(err, SERVER_FIELDS, (field, fieldError) => {
        touched.push(field);
        setError(field, fieldError);
      });
      if (!mapped && (error.code === 'top_up_amount_out_of_range' || error.code === 'currency_not_supported')) {
        setError('amount', { type: 'server', message: error.message });
        touched.push('amount');
      }
      if (!mapped && error.code === 'transfer_reference_duplicate') {
        setError('transferReference', { type: 'server', message: t('finance.topUp.transfer.referenceDuplicate') });
        touched.push('transferReference');
      }
      const step = firstStep(touched);
      if (step) {
        navigation.popTo(step);
        return;
      }
      setApiError(error);
    },
    [exitToPending, exitToWallet, navigation, refetchChannels, setError, setNotice, t, toast],
  );

  const onInvalid = useCallback(
    (errors: FieldErrors<TopUpFormValues>) => {
      const fields = (Object.keys(errors) as FormField[]).filter(field => field in FIELD_STEP);
      const step = firstStep(fields);
      if (step) navigation.popTo(step);
    },
    [navigation],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading || !values.channel || !values.amount || !values.receipt) return;
      setApiError(null);
      const body = new FormData();
      body.append('channel', values.channel);
      body.append('currency', values.amount.currency);
      body.append('amount', String(values.amount.amount));
      body.append('transfer_reference', values.transferReference.trim());
      body.append('receipt', toFormDataFile(values.receipt));
      try {
        const topUp = await action.run(idempotencyKey => createTopUp({ body, idempotencyKey }).unwrap());
        finish(topUp.id);
      } catch (err) {
        handleFailure(err);
      }
    }, onInvalid)();
  }, [action, createTopUp, finish, handleFailure, handleSubmit, isLoading, onInvalid]);

  return {
    credit,
    estimate: isSyp,
    against: isSyp && amount ? t('finance.topUp.review.against', { amount: formatMoney(amount, lang) }) : null,
    transferRows,
    proofRows,
    editTransfer,
    editProof,
    apiError,
    isSubmitting: isLoading,
    onSubmit,
  };
};

export type TopUpReviewScreenModel = ReturnType<typeof useTopUpReviewScreen>;
