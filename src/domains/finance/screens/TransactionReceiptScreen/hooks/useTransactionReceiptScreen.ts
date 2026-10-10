import { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import type { ParseKeys } from 'i18next';
import { normalizeApiError } from '@/core/api';
import { formatDate, formatMoney, formatNumber } from '@/core/i18n';
import type { CurrencyCode, Money } from '@/core/money';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { useOpenSupport } from '@/domains/auth';
import { useGetWalletTransactionQuery } from '../../../api/walletApi';
import {
  LINE_STATUS_PILL,
  lineDisplayAmount,
  lineKind,
  lineTitle,
} from '../../../constants/walletLineLook';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';

type Route = WalletStackScreenProps<'TransactionReceipt'>['route'];

export type ReceiptStatus = 'loading' | 'notFound' | 'error' | 'ready';

export interface ReceiptRow {
  key: string;
  label: string;
  value: string;
}

const NOT_FOUND = 404;
const DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

/** The paid side of a two-currency line ("Amount in SYP"). */
const IN_CURRENCY_LABEL = {
  USD: 'finance.receipt.amountInUsd',
  SYP: 'finance.receipt.amountInSyp',
} as const satisfies Record<CurrencyCode, ParseKeys>;

/**
 * Receipt of one line (Money archetype, rule 09 §2.1): only what the server sent, always
 * with amounts shown (opening it is a deliberate tap). Copy the reference, share a plain
 * text receipt, or report a problem to support with the reference filled in.
 */
export const useTransactionReceiptScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { reference } = useRoute<Route>().params;
  const toast = useToast();
  const openSupport = useOpenSupport();
  const { data: line, error, isError, refetch } = useGetWalletTransactionQuery(reference);

  // A 404 = not this user's line, or gone: nothing to retry.
  const status: ReceiptStatus = line
    ? 'ready'
    : isError
      ? normalizeApiError(error).statusCode === NOT_FOUND
        ? 'notFound'
        : 'error'
      : 'loading';

  const view = useMemo(() => {
    if (!line) return null;
    const amount = lineDisplayAmount(line);
    const signed = line.affects_balance;
    const amountText = formatMoney(amount, lang, { signDisplay: signed ? 'exceptZero' : 'auto' });

    const created = new Date(line.created_at);
    const date = Number.isNaN(created.getTime())
      ? null
      : t('finance.receipt.dateTime', {
          date: formatDate(created, DATE, lang),
          time: formatDate(created, TIME, lang),
        });

    const details: ReceiptRow[] = [
      { key: 'type', label: t('finance.receipt.type'), value: line.type_label },
    ];
    if (line.counterparty) {
      details.push({
        key: 'counterparty',
        label: t(line.direction === 'credit' ? 'finance.receipt.from' : 'finance.receipt.to'),
        value: line.counterparty.name,
      });
    }
    if (date) details.push({ key: 'date', label: t('finance.receipt.date'), value: date });

    // The other currency of the line (a SYP payout or top-up) and the rate it used.
    const original: Money | null =
      line.original && line.original.currency !== line.amount.currency
        ? { amount: Math.abs(line.original.amount), currency: line.original.currency }
        : null;
    const amounts: ReceiptRow[] = [];
    // Creator release: gross and Sada's cut, display only (the amount above is already net).
    if (line.commission) {
      amounts.push(
        { key: 'gross', label: t('finance.receipt.gross'), value: formatMoney(line.commission.gross, lang) },
        {
          key: 'commission',
          label: t('finance.receipt.commission', { rate: formatNumber(line.commission.rate_percent, {}, lang) }),
          value: formatMoney(
            { ...line.commission.commission, amount: -line.commission.commission.amount },
            lang,
          ),
        },
      );
    }
    if (original) {
      amounts.push({
        key: 'original',
        label: t(IN_CURRENCY_LABEL[original.currency]),
        value: formatMoney(original, lang),
      });
      const sides = line.exchange_rate
        ? formatExchangeRateSides(line.exchange_rate, line.amount.currency, original.currency, lang)
        : null;
      if (sides) {
        amounts.push({ key: 'rate', label: t('finance.receipt.rate'), value: t('finance.wallet.rate.value', sides) });
      }
    }

    return {
      kind: lineKind(line),
      pill: line.status ? LINE_STATUS_PILL[line.status] : null,
      title: lineTitle(line),
      amount,
      amountText,
      signed,
      credit: line.direction === 'credit',
      statusLabel: line.status_label,
      details,
      amounts,
      // A memo line (escrow held for a creator) didn't move the balance.
      balanceAfter: signed ? line.balance_after : null,
      date,
    };
  }, [lang, line, t]);

  const onCopyReference = useCallback(() => {
    if (!line) return;
    Clipboard.setString(line.reference);
    toast.success(t('finance.receipt.referenceCopied'));
  }, [line, t, toast]);

  const onShare = useCallback(() => {
    if (!view || !line) return;
    const rows = [
      view.title,
      `${t('finance.receipt.amount')}: ${view.amountText}`,
      view.statusLabel ? `${t('finance.receipt.status')}: ${view.statusLabel}` : null,
      view.date ? `${t('finance.receipt.date')}: ${view.date}` : null,
      `${t('finance.receipt.reference')}: ${line.reference}`,
    ].filter((row): row is string => row !== null);
    // Dismissing the share sheet is not a failure; nothing to report.
    Share.share({ message: [t('finance.receipt.shareTitle'), ...rows].join('\n') }).catch(() => undefined);
  }, [line, t, view]);

  const onReport = useCallback(() => {
    openSupport(t('finance.receipt.supportMessage', { reference: line?.reference ?? reference }));
  }, [line?.reference, openSupport, reference, t]);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    title: t('finance.receipt.title'),
    status,
    view,
    reference: line?.reference ?? reference,
    onCopyReference,
    onShare,
    onReport,
    retry,
  };
};

export type TransactionReceiptModel = ReturnType<typeof useTransactionReceiptScreen>;
