import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { createIdempotentAction, type IdempotentAction } from '@/core/api';
import { useDiscardGuard } from '@/core/hooks';
import type { Money } from '@/core/money';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useGetWalletQuery } from '../api/walletApi';
import { useGetWithdrawalQuoteQuery } from '../api/withdrawalApi';
import { WITHDRAW_QUOTE_DEBOUNCE_MS } from '../constants/withdraw';
import { createWithdrawSchema, type WithdrawFormValues } from '../schemas/withdrawSchema';
import type {
  PaymentChannel,
  PayoutMethod,
  WithdrawalBlock,
  WithdrawalQuote,
  WithdrawalReason,
  WithdrawalRequestBody,
} from '../types';
import type { PayoutMethodView } from '../utils/payoutMethodView';
import { usePayoutMethods } from './usePayoutMethods';

type Navigation = WalletStackScreenProps<'Withdraw'>['navigation'];

export type WithdrawLoadStatus = 'loading' | 'error' | 'ready';
/** `idle` = nothing to price yet (no method or no amount). */
export type WithdrawQuoteStatus = 'idle' | 'loading' | 'error' | 'ready';

/** How the wizard ends: the new request's detail, or back to the wallet (its hero explains a blocker). */
type WithdrawExit = { kind: 'detail'; id: string } | { kind: 'wallet' };

export interface WithdrawFlow {
  /** Balance and methods both needed before the amount step can work. */
  loadStatus: WithdrawLoadStatus;
  retryLoad: () => void;
  available: Money | null;
  methods: readonly PayoutMethod[];
  views: readonly PayoutMethodView[];
  method: PayoutMethod | null;
  methodView: PayoutMethodView | null;
  /** Last quote received (kept while a newer one loads, shown dimmed). */
  quote: WithdrawalQuote | null;
  quoteStatus: WithdrawQuoteStatus;
  retryQuote: () => void;
  /** The server won't take this request: every reason, plus when to come back. */
  blockReasons: readonly WithdrawalReason[];
  nextAllowedAt: string | null;
  blocked: boolean;
  /** A `422 withdrawal_not_allowed` on submit, shown until the request changes. */
  setSubmitBlock: (block: WithdrawalBlock) => void;
  /** One idempotency key per wizard session (rule 06). */
  action: IdempotentAction;
  /** Step 1's ✕: leaves the flow (asks first when something was entered). */
  close: () => void;
  /** Opens the payout method form; the new method becomes the destination on return. */
  addMethod: (channel: PaymentChannel) => void;
  finish: (id: string) => void;
  exitToWallet: () => void;
}

export const WithdrawFlowContext = createContext<WithdrawFlow | null>(null);

/** The wizard state for its steps; only valid under `WithdrawNavigator`. */
export const useWithdrawFlow = (): WithdrawFlow => {
  const flow = useContext(WithdrawFlowContext);
  if (!flow) throw new Error('useWithdrawFlow must be used inside WithdrawNavigator');
  return flow;
};

const DEFAULT_VALUES: WithdrawFormValues = { payoutMethodId: null, currency: 'USD', amount: null };

const sameRequest = (a: WithdrawalRequestBody | null, b: WithdrawalRequestBody | null): boolean =>
  a?.payout_method_id === b?.payout_method_id &&
  a?.amount_cents === b?.amount_cents &&
  a?.payout_currency === b?.payout_currency;

/**
 * Navigator-level state of the withdraw wizard: one form for both steps, the balance,
 * the destination (the primary method unless the creator picks another) and the live
 * quote, asked for a moment after the last keystroke. The server decides: a blocked
 * quote lists every reason and the primary stays disabled (approved for server blocks).
 */
export const useWithdrawFlowState = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Navigation>();

  const walletQuery = useGetWalletQuery();
  const payouts = usePayoutMethods();
  const available = walletQuery.data?.available ?? null;
  const methods = payouts.methods;

  const loadStatus: WithdrawLoadStatus =
    walletQuery.data && methods
      ? 'ready'
      : (walletQuery.isError && !walletQuery.data) || payouts.isError
        ? 'error'
        : 'loading';

  const schema = useMemo(
    () => createWithdrawSchema(t, { available, lang: i18n.language }),
    [available, i18n.language, t],
  );
  const form = useForm<WithdrawFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });
  const { setValue } = form;

  const payoutMethodId = useWatch({ control: form.control, name: 'payoutMethodId' });
  const currency = useWatch({ control: form.control, name: 'currency' });
  const amount = useWatch({ control: form.control, name: 'amount' });

  // Ids saved before "Add payout method": the one that appears after it is the new destination.
  const knownIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!methods) return;
    const known = knownIds.current;
    const added = known ? methods.find(item => !known.has(item.id)) : undefined;
    if (added) {
      knownIds.current = null;
      setValue('payoutMethodId', added.id, { shouldDirty: true });
      return;
    }
    if (payoutMethodId && methods.some(item => item.id === payoutMethodId)) return;
    // The primary by default (not an edit: leaving stays free); a deleted pick falls back to it.
    const fallback = methods.find(item => item.is_default) ?? methods[0];
    setValue('payoutMethodId', fallback?.id ?? null);
  }, [methods, payoutMethodId, setValue]);

  const method = useMemo(
    () => methods?.find(item => item.id === payoutMethodId) ?? null,
    [methods, payoutMethodId],
  );
  const methodView = useMemo(
    () => payouts.views.find(view => view.id === payoutMethodId) ?? null,
    [payoutMethodId, payouts.views],
  );

  // A method that doesn't pay out in the picked currency switches it (cash wallets: pounds only).
  useEffect(() => {
    const first = method?.currencies[0];
    if (!method || !first || method.currencies.includes(currency)) return;
    setValue('currency', first);
  }, [currency, method, setValue]);

  const request = useMemo<WithdrawalRequestBody | null>(
    () =>
      payoutMethodId && amount && amount.amount > 0
        ? { payout_method_id: payoutMethodId, amount_cents: amount.amount, payout_currency: currency }
        : null,
    [amount, currency, payoutMethodId],
  );

  const [debounced, setDebounced] = useState<WithdrawalRequestBody | null>(null);
  useEffect(() => {
    if (!request) {
      setDebounced(null);
      return;
    }
    const id = setTimeout(() => setDebounced(request), WITHDRAW_QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [request]);

  const quoteQuery = useGetWithdrawalQuoteQuery(debounced ?? skipToken);
  const current = sameRequest(request, debounced);
  const settledQuote = current && !quoteQuery.isFetching ? (quoteQuery.currentData ?? null) : null;
  const quoteStatus: WithdrawQuoteStatus = !request
    ? 'idle'
    : settledQuote
      ? 'ready'
      : current && quoteQuery.isError && !quoteQuery.isFetching
        ? 'error'
        : 'loading';

  const [submitBlock, setSubmitBlockState] = useState<{
    request: WithdrawalRequestBody | null;
    block: WithdrawalBlock;
  } | null>(null);
  const requestRef = useRef(request);
  requestRef.current = request;
  const setSubmitBlock = useCallback(
    (block: WithdrawalBlock) => setSubmitBlockState({ request: requestRef.current, block }),
    [],
  );
  const activeSubmitBlock =
    submitBlock && sameRequest(submitBlock.request, request) ? submitBlock.block : null;

  const quoteBlocked = !!settledQuote && !settledQuote.allowed;
  const blocked = quoteBlocked || !!activeSubmitBlock;
  const blockReasons = useMemo<readonly WithdrawalReason[]>(() => {
    if (quoteBlocked && settledQuote) return settledQuote.reasons;
    return activeSubmitBlock?.reasons ?? [];
  }, [activeSubmitBlock, quoteBlocked, settledQuote]);
  const nextAllowedAt = quoteBlocked
    ? (settledQuote?.next_allowed_at ?? null)
    : (activeSubmitBlock?.next_allowed_at ?? null);

  const actionRef = useRef<IdempotentAction | null>(null);
  actionRef.current ??= createIdempotentAction();
  const [exit, setExit] = useState<WithdrawExit | null>(null);

  const { isDirty } = form.formState;
  const guard = useDiscardGuard(isDirty && exit === null);

  // Leaves only after the guard has been switched off by the render above.
  useEffect(() => {
    if (!exit) return;
    switch (exit.kind) {
      case 'detail':
        navigation.replace('WithdrawalDetail', { id: exit.id, submitted: true });
        return;
      case 'wallet':
        navigation.goBack();
        return;
      default: {
        const _exhaustive: never = exit;
        return _exhaustive;
      }
    }
  }, [exit, navigation]);

  const close = useCallback(() => navigation.goBack(), [navigation]);
  const finish = useCallback((id: string) => setExit({ kind: 'detail', id }), []);
  const exitToWallet = useCallback(() => setExit({ kind: 'wallet' }), []);

  const methodsRef = useRef(methods);
  methodsRef.current = methods;
  const addMethod = useCallback(
    (channel: PaymentChannel) => {
      knownIds.current = new Set((methodsRef.current ?? []).map(item => item.id));
      navigation.navigate('PayoutMethodForm', { channel });
    },
    [navigation],
  );

  const { refetch: refetchWallet } = walletQuery;
  const { refetch: refetchMethods, isError: methodsError } = payouts;
  const walletError = walletQuery.isError;
  const retryLoad = useCallback(() => {
    if (walletError) refetchWallet();
    if (methodsError) refetchMethods();
  }, [methodsError, refetchMethods, refetchWallet, walletError]);

  const { refetch: refetchQuote } = quoteQuery;
  const hasQuoteArgs = debounced !== null;
  const retryQuote = useCallback(() => {
    if (hasQuoteArgs) refetchQuote();
  }, [hasQuoteArgs, refetchQuote]);

  const flow = useMemo<WithdrawFlow>(
    () => ({
      loadStatus,
      retryLoad,
      available,
      methods: methods ?? [],
      views: payouts.views,
      method,
      methodView,
      quote: request ? (quoteQuery.data ?? null) : null,
      quoteStatus,
      retryQuote,
      blockReasons,
      nextAllowedAt,
      blocked,
      setSubmitBlock,
      action: actionRef.current ?? createIdempotentAction(),
      close,
      addMethod,
      finish,
      exitToWallet,
    }),
    [
      addMethod,
      available,
      blockReasons,
      blocked,
      close,
      exitToWallet,
      finish,
      loadStatus,
      method,
      methodView,
      methods,
      nextAllowedAt,
      payouts.views,
      quoteQuery.data,
      quoteStatus,
      request,
      retryLoad,
      retryQuote,
      setSubmitBlock,
    ],
  );

  return { form, flow, guard };
};
