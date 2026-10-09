import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createIdempotentAction, type IdempotentAction } from '@/core/api';
import { useDiscardGuard } from '@/core/hooks';
import type { Money } from '@/core/money';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useGetTopUpChannelsQuery } from '../api/topUpApi';
import { createTopUpSchema, type TopUpFormValues } from '../schemas/topUpSchema';
import { PAYMENT_CHANNELS } from '../types';
import type { TopUpChannelOption, TopUpChannels, TopUpLimits } from '../types';
import { estimateCredit, fallbackLimits } from '../utils/topUpEstimate';
import { isOneOf } from '../utils/walletMappers';

type Navigation = WalletStackScreenProps<'TopUp'>['navigation'];
type Route = WalletStackScreenProps<'TopUp'>['route'];

export type TopUpChannelsStatus = 'loading' | 'error' | 'ready';

/** Why the wizard sent the brand back a step after a failed submit. */
export type TopUpFlowNotice = 'rateChanged' | 'channelPaused';

/**
 * How the wizard ends: the new top-up's detail, back to the wallet (its hero explains a
 * blocker), or the top-ups in review (too many open requests).
 */
type TopUpExit = { kind: 'detail'; id: string } | { kind: 'wallet' } | { kind: 'pending' };

export interface TopUpFlow {
  channels: TopUpChannels | undefined;
  channelsStatus: TopUpChannelsStatus;
  refetchChannels: () => void;
  selected: TopUpChannelOption | null;
  /** Range for the picked channel + currency; `null` = unknown (the server checks). */
  limits: TopUpLimits | null;
  /** Fresh SYP per USD, `null` while stale or missing. */
  rate: string | null;
  /** What the wallet would get for the typed amount (SYP = client estimate). */
  credit: Money | null;
  /** One idempotency key per wizard session (rule 06). */
  action: IdempotentAction;
  notice: TopUpFlowNotice | null;
  setNotice: (notice: TopUpFlowNotice | null) => void;
  /** Step 1's ✕: leaves the flow (asks first when something was entered). */
  close: () => void;
  finish: (id: string) => void;
  exitToWallet: () => void;
  exitToPending: () => void;
}

export const TopUpFlowContext = createContext<TopUpFlow | null>(null);

/** The wizard state for its steps; only valid under `TopUpNavigator`. */
export const useTopUpFlow = (): TopUpFlow => {
  const flow = useContext(TopUpFlowContext);
  if (!flow) throw new Error('useTopUpFlow must be used inside TopUpNavigator');
  return flow;
};

/**
 * Navigator-level state of the top-up wizard: one form across the four steps, the
 * channels (fresh on every open), the picked channel's limits and the credit estimate.
 * Leaving with something entered asks first; a finished or blocked flow leaves freely.
 */
export const useTopUpFlowState = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const prefill = useRoute<Route>().params;

  const channelsQuery = useGetTopUpChannelsQuery(undefined, { refetchOnMountOrArgChange: true });
  const channels = channelsQuery.data;
  const channelsStatus: TopUpChannelsStatus = channels
    ? 'ready'
    : channelsQuery.isError
      ? 'error'
      : 'loading';

  const [defaultValues] = useState<TopUpFormValues>(() => {
    const channel =
      prefill && isOneOf(PAYMENT_CHANNELS, prefill.channel) ? prefill.channel : null;
    return {
      channel,
      currency: channel && prefill ? prefill.amount.currency : 'USD',
      amount: channel && prefill ? prefill.amount : null,
      transferReference: '',
      receipt: null,
    };
  });

  const [limitsForSchema, setLimitsForSchema] = useState<TopUpLimits | null>(null);
  const schema = useMemo(
    () => createTopUpSchema(t, { limits: limitsForSchema, lang: i18n.language }),
    [i18n.language, limitsForSchema, t],
  );
  const form = useForm<TopUpFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const channel = useWatch({ control: form.control, name: 'channel' });
  const currency = useWatch({ control: form.control, name: 'currency' });
  const amount = useWatch({ control: form.control, name: 'amount' });

  const selected = useMemo(
    () => channels?.channels.find(option => option.channel === channel) ?? null,
    [channel, channels],
  );
  const rate = channels?.rate && !channels.rate.is_stale ? channels.rate.rate : null;
  const limits = useMemo(
    () => (selected ? (selected.limits[currency] ?? fallbackLimits(currency, rate)) : null),
    [currency, rate, selected],
  );
  useEffect(() => setLimitsForSchema(limits), [limits]);
  // Read at exit only: the submitted screen shows the channel's review time.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // A channel that no longer takes the picked currency (SYP-only wallets, a stale rate) switches it.
  const { setValue } = form;
  useEffect(() => {
    const first = selected?.currencies[0];
    if (!selected || !first || selected.currencies.includes(currency)) return;
    setValue('currency', first);
    setValue('amount', null);
  }, [currency, selected, setValue]);

  const credit = useMemo(
    () => (amount && amount.currency === currency ? estimateCredit(amount, rate) : null),
    [amount, currency, rate],
  );

  const actionRef = useRef<IdempotentAction | null>(null);
  actionRef.current ??= createIdempotentAction();
  const [notice, setNotice] = useState<TopUpFlowNotice | null>(null);
  const [exit, setExit] = useState<TopUpExit | null>(null);

  const { isDirty } = form.formState;
  const guard = useDiscardGuard(isDirty && exit === null);

  // Leaves only after the guard has been switched off by the render above.
  useEffect(() => {
    if (!exit) return;
    switch (exit.kind) {
      case 'detail':
        navigation.replace('TopUpDetail', {
          id: exit.id,
          submitted: true,
          processingTime: selectedRef.current?.processingTimeLabel ?? undefined,
        });
        return;
      case 'pending':
        navigation.replace('TopUps', { status: 'pending_review' });
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
  const exitToPending = useCallback(() => setExit({ kind: 'pending' }), []);
  const { refetch } = channelsQuery;
  const refetchChannels = useCallback(() => {
    refetch();
  }, [refetch]);

  const flow = useMemo<TopUpFlow>(
    () => ({
      channels,
      channelsStatus,
      refetchChannels,
      selected,
      limits,
      rate,
      credit,
      action: actionRef.current ?? createIdempotentAction(),
      notice,
      setNotice,
      close,
      finish,
      exitToWallet,
      exitToPending,
    }),
    [
      channels,
      channelsStatus,
      close,
      credit,
      exitToPending,
      exitToWallet,
      finish,
      limits,
      notice,
      rate,
      refetchChannels,
      selected,
    ],
  );

  return { form, flow, guard };
};
