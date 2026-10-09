import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { createIdempotentAction, normalizeApiError, type IdempotentAction } from '@/core/api';
import { formatDate, formatMoney } from '@/core/i18n';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { useToast } from '@/core/toast';
import { useOpenSupport } from '@/domains/auth';
import type { TimelineStep } from '@/shared/ui';
import { useCancelWithdrawalMutation, useGetWithdrawalQuery } from '../../../api/withdrawalApi';
import { WITHDRAWAL_STATUS_LOOK } from '../../../constants/withdraw';
import type { Withdrawal } from '../../../types';
import { exchangeRateLine } from '../../../utils/exchangeRateText';
import {
  isWithdrawalLost,
  withdrawalBadgeColors,
  withdrawalDestination,
  withdrawalStatusLabel,
} from '../../../utils/withdrawalView';

type Navigation = WalletStackScreenProps<'WithdrawalDetail'>['navigation'];
type Route = WalletStackScreenProps<'WithdrawalDetail'>['route'];

export type WithdrawalDetailStatus = 'loading' | 'notFound' | 'error' | 'ready';

export interface DetailRow {
  key: string;
  label: string;
  value: string;
  /** Copyable value (receipt number, request number). */
  copy?: boolean;
}

const NOT_FOUND = 404;
const DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

/**
 * One withdrawal (Money archetype, receipt): what left the balance, the transfer timeline,
 * why it was rejected or returned, the details and the amounts. Right after submitting
 * (`submitted`) it is the confirmation: ✕, "Back to wallet" and history. A pending request
 * can be cancelled (confirm first; its own idempotency key, rule 06).
 */
export const useWithdrawalDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const { id, submitted = false } = useRoute<Route>().params;
  const { colors } = useTheme();
  const toast = useToast();
  const openSupport = useOpenSupport();
  const { data: withdrawal, error, isError, refetch } = useGetWithdrawalQuery(id);
  const [cancelWithdrawal, { isLoading: isCancelling }] = useCancelWithdrawalMutation();
  const [cancelVisible, setCancelVisible] = useState(false);
  const cancelAction = useRef<IdempotentAction | null>(null);
  cancelAction.current ??= createIdempotentAction();

  const status: WithdrawalDetailStatus = withdrawal
    ? 'ready'
    : isError
      ? normalizeApiError(error).statusCode === NOT_FOUND
        ? 'notFound'
        : 'error'
      : 'loading';

  const formatWhen = useCallback(
    (iso: string | null): string | null => {
      if (!iso) return null;
      const when = new Date(iso);
      if (Number.isNaN(when.getTime())) return null;
      return t('finance.withdraw.detail.dateTime', {
        date: formatDate(when, DATE, lang),
        time: formatDate(when, TIME, lang),
      });
    },
    [lang, t],
  );

  const buildSteps = useCallback(
    (item: Withdrawal, destination: string | null): TimelineStep[] => {
      const arrived = destination
        ? t('finance.withdraw.detail.timeline.arrived', { destination })
        : t('finance.withdraw.detail.timeline.arrivedNoDestination');
      const steps: TimelineStep[] = [
        {
          key: 'requested',
          title: t('finance.withdraw.detail.timeline.requested'),
          caption: formatWhen(item.created_at) ?? undefined,
          state: 'done',
        },
      ];
      switch (item.status) {
        case 'pending':
        case null:
          steps.push(
            {
              key: 'transfer',
              title: t('finance.withdraw.detail.timeline.transfer'),
              caption: t('finance.withdraw.detail.timeline.transferCaption'),
              state: 'current',
            },
            { key: 'arrived', title: arrived, state: 'upcoming' },
          );
          break;
        case 'completed':
        case 'returned':
          steps.push(
            { key: 'transfer', title: t('finance.withdraw.detail.timeline.transfer'), state: 'done' },
            { key: 'arrived', title: arrived, caption: formatWhen(item.completed_at) ?? undefined, state: 'done' },
          );
          if (item.status === 'returned') {
            steps.push({
              key: 'returned',
              title: t('finance.withdraw.detail.timeline.returned'),
              caption: formatWhen(item.returned_at) ?? undefined,
              state: 'error',
            });
          }
          break;
        case 'rejected':
          steps.push({
            key: 'rejected',
            title: t('finance.withdraw.detail.timeline.rejected'),
            caption: formatWhen(item.rejected_at) ?? undefined,
            state: 'error',
          });
          break;
        case 'cancelled':
          steps.push({
            key: 'cancelled',
            title: t('finance.withdraw.detail.timeline.cancelled'),
            caption: formatWhen(item.cancelled_at) ?? undefined,
            state: 'error',
          });
          break;
        default: {
          const _exhaustive: never = item.status;
          return _exhaustive;
        }
      }
      return steps;
    },
    [formatWhen, t],
  );

  const view = useMemo(() => {
    if (!withdrawal) return null;
    const destination = withdrawalDestination(withdrawal, t);
    const lost = isWithdrawalLost(withdrawal);
    const requestedAt = formatWhen(withdrawal.created_at);
    const converted =
      !!withdrawal.net_payout && withdrawal.net_payout.currency !== withdrawal.gross.currency;

    const details: DetailRow[] = [];
    if (destination) details.push({ key: 'to', label: t('finance.withdraw.detail.to'), value: destination });
    if (requestedAt) details.push({ key: 'date', label: t('finance.withdraw.detail.date'), value: requestedAt });
    const completedAt = withdrawal.status === 'completed' ? formatWhen(withdrawal.completed_at) : null;
    if (completedAt) details.push({ key: 'completed', label: t('finance.withdraw.detail.completedAt'), value: completedAt });
    const returnedAt = withdrawal.status === 'returned' ? formatWhen(withdrawal.returned_at) : null;
    if (returnedAt) details.push({ key: 'returned', label: t('finance.withdraw.detail.returnedAt'), value: returnedAt });
    if (withdrawal.receipt_number) {
      details.push({
        key: 'receipt',
        label: t('finance.withdraw.detail.receiptNumber'),
        value: withdrawal.receipt_number,
        copy: true,
      });
    }
    details.push({ key: 'id', label: t('finance.withdraw.detail.requestId'), value: withdrawal.id, copy: true });

    const amounts: DetailRow[] = [
      { key: 'gross', label: t('finance.withdraw.detail.gross'), value: formatMoney(withdrawal.gross, lang) },
    ];
    if (withdrawal.fee) amounts.push({ key: 'fee', label: t('finance.withdraw.detail.fee'), value: formatMoney(withdrawal.fee, lang) });
    if (withdrawal.net) amounts.push({ key: 'net', label: t('finance.withdraw.detail.net'), value: formatMoney(withdrawal.net, lang) });
    if (converted && withdrawal.net_payout) {
      amounts.push({ key: 'payout', label: t('finance.withdraw.detail.payout'), value: formatMoney(withdrawal.net_payout, lang) });
      const rate = withdrawal.exchange_rate
        ? exchangeRateLine(withdrawal.exchange_rate, withdrawal.gross.currency, withdrawal.net_payout.currency, lang, t)
        : null;
      if (rate) amounts.push({ key: 'rate', label: t('finance.withdraw.detail.rate'), value: rate });
    }

    const reason =
      withdrawal.status === 'rejected'
        ? {
            tone: 'danger' as const,
            title: t('finance.withdraw.detail.rejectionTitle'),
            message: withdrawal.rejection_reason ?? t('finance.withdraw.detail.noReason'),
          }
        : withdrawal.status === 'returned'
          ? {
              tone: 'info' as const,
              title: t('finance.withdraw.detail.returnedTitle'),
              message: withdrawal.return_reason ?? t('finance.withdraw.detail.noReason'),
            }
          : null;

    return {
      title:
        submitted && withdrawal.status === 'pending'
          ? t('finance.withdraw.detail.submittedTitle')
          : destination
            ? t('finance.withdraw.history.rowTitle', { destination })
            : t('finance.withdraw.history.rowTitleNoDestination'),
      // Money out: signed minus, neutral (rule 09 §2.1), struck through when it never left.
      amount: { ...withdrawal.gross, amount: -withdrawal.gross.amount },
      lost,
      badge: withdrawalBadgeColors(withdrawal, colors),
      statusLabel: withdrawalStatusLabel(withdrawal, t),
      look: withdrawal.status ? WITHDRAWAL_STATUS_LOOK[withdrawal.status] : null,
      steps: buildSteps(withdrawal, destination),
      reason,
      details,
      amounts,
      canCancel: withdrawal.status === 'pending',
      returned: withdrawal.status === 'returned',
    };
  }, [buildSteps, colors, formatWhen, lang, submitted, t, withdrawal]);

  const onCopy = useCallback(
    (value: string) => {
      Clipboard.setString(value);
      toast.success(t('finance.withdraw.detail.copied'));
    },
    [t, toast],
  );

  const openCancel = useCallback(() => setCancelVisible(true), []);
  const closeCancel = useCallback(() => setCancelVisible(false), []);
  const confirmCancel = useCallback(async () => {
    const action = cancelAction.current;
    if (isCancelling || !action) return;
    try {
      await action.run(idempotencyKey => cancelWithdrawal({ id, idempotencyKey }).unwrap());
      setCancelVisible(false);
      toast.success(t('finance.withdraw.detail.cancelled'));
    } catch (err) {
      setCancelVisible(false);
      if (normalizeApiError(err).code === 'withdrawal_not_pending') {
        // Paid or rejected meanwhile: show what it is now.
        toast.warning(t('finance.withdraw.detail.notPending'));
        refetch();
        return;
      }
      toast.error(t('finance.withdraw.detail.cancelFailed'));
    }
  }, [cancelWithdrawal, id, isCancelling, refetch, t, toast]);
  const onConfirmCancel = useCallback(() => {
    confirmCancel().catch(() => undefined);
  }, [confirmCancel]);

  const backToWallet = useCallback(() => navigation.popTo('WalletScreen'), [navigation]);
  const openHistory = useCallback(() => navigation.replace('Withdrawals'), [navigation]);
  const openPayoutMethods = useCallback(() => navigation.navigate('PayoutMethods'), [navigation]);
  const onReport = useCallback(
    () => openSupport(t('finance.withdraw.detail.supportMessage', { id })),
    [id, openSupport, t],
  );
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    submitted,
    status,
    view,
    retry,
    onCopy,
    cancelVisible,
    openCancel,
    closeCancel,
    onConfirmCancel,
    isCancelling,
    backToWallet,
    openHistory,
    openPayoutMethods,
    onReport,
  };
};

export type WithdrawalDetailScreenModel = ReturnType<typeof useWithdrawalDetailScreen>;
