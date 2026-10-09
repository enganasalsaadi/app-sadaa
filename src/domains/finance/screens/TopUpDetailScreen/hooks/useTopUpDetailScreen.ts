import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { normalizeApiError } from '@/core/api';
import { env } from '@/core/config';
import { formatDate, formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { useOpenSupport } from '@/domains/auth';
import type { NoticeTone, TimelineStep } from '@/shared/ui';
import { useGetTopUpQuery } from '../../../api/topUpApi';
import { TOP_UP_STATUS_LOOK } from '../../../constants/topUp';
import type { TopUp, TopUpReceipt } from '../../../types';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';
import { isReceiptLinkExpired, isTrustedReceiptUrl } from '../../../utils/receiptUrl';
import { topUpChannelLabel, topUpStatusLabel } from '../../../utils/topUpView';

type Navigation = WalletStackScreenProps<'TopUpDetail'>['navigation'];
type Route = WalletStackScreenProps<'TopUpDetail'>['route'];

export type TopUpDetailStatus = 'loading' | 'notFound' | 'error' | 'ready';

export interface DetailRow {
  key: string;
  label: string;
  value: string;
}

const NOT_FOUND = 404;
const DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
const IMAGE_MIME = /^image\//;

/** What the wallet gets: the server's dollars, or the amount itself when sent in dollars. */
const creditOf = (topUp: TopUp): Money | null =>
  topUp.amount_usd ?? (topUp.amount.currency === 'USD' ? topUp.amount : null);

/**
 * One top-up request (Money archetype, receipt): what the wallet gets, the review
 * timeline, why it was rejected or reversed, the details and the receipt. Right after
 * submitting (`submitted`) it is the confirmation: ✕ and "Back to wallet".
 */
export const useTopUpDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const { id, submitted = false, processingTime } = useRoute<Route>().params;
  const toast = useToast();
  const openSupport = useOpenSupport();
  const { data: topUp, error, isError, refetch } = useGetTopUpQuery(id);
  const [galleryVisible, setGalleryVisible] = useState(false);

  const status: TopUpDetailStatus = topUp
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
      return t('finance.topUp.detail.dateTime', {
        date: formatDate(when, DATE, lang),
        time: formatDate(when, TIME, lang),
      });
    },
    [lang, t],
  );

  const view = useMemo(() => {
    if (!topUp) return null;
    const completed = topUp.status === 'completed';
    const lost = topUp.status === 'rejected' || topUp.status === 'reversed';
    const sentInOther = topUp.amount.currency !== 'USD';
    const channel = topUpChannelLabel(topUp, t);
    const submittedAt = formatWhen(topUp.submitted_at);

    const steps: TimelineStep[] = [
      { key: 'submitted', title: t('finance.topUp.detail.timeline.submitted'), caption: submittedAt ?? undefined, state: 'done' },
    ];
    switch (topUp.status) {
      case 'pending_review':
      case null:
        steps.push(
          {
            key: 'review',
            title: t('finance.topUp.detail.timeline.review'),
            caption: processingTime ?? t('finance.topUp.detail.timeline.reviewCaption'),
            state: 'current',
          },
          { key: 'credited', title: t('finance.topUp.detail.timeline.credited'), state: 'upcoming' },
        );
        break;
      case 'completed':
      case 'reversed':
        steps.push(
          {
            key: 'review',
            title: t('finance.topUp.detail.timeline.review'),
            caption: formatWhen(topUp.reviewed_at) ?? undefined,
            state: 'done',
          },
          {
            key: 'credited',
            title: t('finance.topUp.detail.timeline.credited'),
            caption: formatWhen(topUp.completed_at) ?? undefined,
            state: 'done',
          },
        );
        if (topUp.status === 'reversed') {
          steps.push({
            key: 'reversed',
            title: t('finance.topUp.detail.timeline.reversed'),
            caption: formatWhen(topUp.reversed_at) ?? undefined,
            state: 'error',
          });
        }
        break;
      case 'rejected':
        steps.push({
          key: 'rejected',
          title: t('finance.topUp.detail.timeline.rejected'),
          caption: formatWhen(topUp.reviewed_at) ?? undefined,
          state: 'error',
        });
        break;
      default: {
        const _exhaustive: never = topUp.status;
        return _exhaustive;
      }
    }

    const details: DetailRow[] = [];
    if (channel) details.push({ key: 'method', label: t('finance.topUp.detail.method'), value: channel });
    if (submittedAt) details.push({ key: 'date', label: t('finance.topUp.detail.date'), value: submittedAt });
    details.push({ key: 'sent', label: t('finance.topUp.detail.sent'), value: formatMoney(topUp.amount, lang) });
    const sides =
      sentInOther && topUp.exchange_rate
        ? formatExchangeRateSides(topUp.exchange_rate, 'USD', topUp.amount.currency, lang)
        : null;
    if (sides) details.push({ key: 'rate', label: t('finance.topUp.detail.rate'), value: t('finance.wallet.rate.value', sides) });
    if (completed && topUp.amount_usd) {
      details.push({ key: 'credited', label: t('finance.topUp.detail.credited'), value: formatMoney(topUp.amount_usd, lang) });
    }
    if (topUp.transfer_reference) {
      details.push({ key: 'reference', label: t('finance.topUp.detail.reference'), value: topUp.transfer_reference });
    }

    const reason =
      topUp.status === 'rejected'
        ? { title: t('finance.topUp.detail.rejectionTitle'), message: topUp.rejection_reason, tone: 'danger' as NoticeTone }
        : topUp.status === 'reversed'
          ? { title: t('finance.topUp.detail.reversalTitle'), message: topUp.reversal_reason, tone: 'danger' as NoticeTone }
          : null;

    return {
      title:
        submitted && topUp.status === 'pending_review'
          ? t('finance.topUp.detail.submittedTitle')
          : channel
            ? t('finance.topUp.history.rowTitle', { channel })
            : t('finance.topUp.history.rowTitleNoChannel'),
      credit: creditOf(topUp),
      estimate: !completed && sentInOther,
      completed,
      lost,
      against: sentInOther ? t('finance.topUp.review.against', { amount: formatMoney(topUp.amount, lang) }) : null,
      statusLabel: topUpStatusLabel(topUp, t),
      look: topUp.status ? TOP_UP_STATUS_LOOK[topUp.status] : null,
      steps,
      reason: reason ? { ...reason, message: reason.message ?? t('finance.topUp.detail.noReason') } : null,
      details,
      receipt: topUp.receipt,
      canRetry: lost && topUp.channel !== null,
      transactionReference: topUp.transaction_reference,
    };
  }, [formatWhen, lang, processingTime, submitted, t, topUp]);

  const onCopyId = useCallback(() => {
    Clipboard.setString(id);
    toast.success(t('finance.topUp.detail.idCopied'));
  }, [id, t, toast]);

  const receipt = topUp?.receipt ?? null;
  const isImageReceipt = receipt ? IMAGE_MIME.test(receipt.mime_type) : false;
  const openingReceipt = useRef(false);
  const showReceipt = useCallback(async () => {
    if (!receipt || openingReceipt.current) return;
    let current: TopUpReceipt | null = receipt;
    // The signed link dies after 10 minutes: a new detail read issues a fresh one.
    if (isReceiptLinkExpired(receipt, Date.now())) {
      openingReceipt.current = true;
      try {
        current = (await refetch().unwrap()).receipt;
      } catch {
        current = null;
      } finally {
        openingReceipt.current = false;
      }
    }
    if (!current) {
      toast.error(t('finance.topUp.detail.receiptOpenFailed'));
      return;
    }
    if (IMAGE_MIME.test(current.mime_type)) {
      setGalleryVisible(true);
      return;
    }
    if (!isTrustedReceiptUrl(current.url, env.API_BASE_URL)) {
      toast.error(t('finance.topUp.detail.receiptOpenFailed'));
      return;
    }
    await Linking.openURL(current.url).catch(() => toast.error(t('finance.topUp.detail.receiptOpenFailed')));
  }, [receipt, refetch, t, toast]);
  const openReceipt = useCallback(() => {
    showReceipt().catch(() => undefined);
  }, [showReceipt]);
  const closeGallery = useCallback(() => setGalleryVisible(false), []);

  const backToWallet = useCallback(() => navigation.popTo('WalletScreen'), [navigation]);
  const openHistory = useCallback(() => navigation.replace('TopUps'), [navigation]);

  const newTopUp = useCallback(() => {
    if (!topUp?.channel) return;
    navigation.navigate('TopUp', { channel: topUp.channel, amount: topUp.amount });
  }, [navigation, topUp]);

  const openTransaction = useCallback(() => {
    const reference = topUp?.transaction_reference;
    if (reference) navigation.navigate('TransactionReceipt', { reference });
  }, [navigation, topUp?.transaction_reference]);

  const onReport = useCallback(
    () => openSupport(t('finance.topUp.detail.supportMessage', { id })),
    [id, openSupport, t],
  );

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    id,
    submitted,
    status,
    view,
    retry,
    onCopyId,
    openReceipt,
    galleryImages: receipt && isImageReceipt ? [receipt.url] : [],
    galleryVisible,
    closeGallery,
    backToWallet,
    openHistory,
    newTopUp,
    openTransaction,
    onReport,
  };
};

export type TopUpDetailScreenModel = ReturnType<typeof useTopUpDetailScreen>;
