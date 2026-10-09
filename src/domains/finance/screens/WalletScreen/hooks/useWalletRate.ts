import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { useGetExchangeRateQuery } from '../../../api/walletApi';
import type { WalletRole } from '../../../types';
import { WALLET_ROLE_COPY } from '../../../constants';
import { formatExchangeRateSides } from '../../../utils/exchangeRateText';

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Today's USD → SYP rate as one line ("1 $ = 14,000 ل.س"), or the stale notice instead:
 * SYP top-ups and payouts are off until an admin updates it (handoff §5).
 */
export const useWalletRate = (role: WalletRole) => {
  const { t, i18n } = useTranslation();
  const rateQuery = useGetExchangeRateQuery();
  const rate = rateQuery.data;

  return useMemo(() => {
    if (!rate) return { rate: null, staleMessage: null, refetch: rateQuery.refetch };
    const sides = formatExchangeRateSides(rate.rate, rate.base, rate.quote, i18n.language);
    if (!sides) return { rate: null, staleMessage: null, refetch: rateQuery.refetch };
    const value = t('finance.wallet.rate.value', sides);

    if (rate.is_stale) {
      return {
        rate: null,
        staleMessage: t(WALLET_ROLE_COPY[role].staleRate, { rate: value }),
        refetch: rateQuery.refetch,
      };
    }

    const effective = new Date(rate.effective_at);
    const valid = !Number.isNaN(effective.getTime());
    const time = valid ? formatDate(effective, { hour: 'numeric', minute: '2-digit' }, i18n.language) : '';
    const updated = !valid
      ? null
      : isSameDay(effective, new Date())
        ? t('finance.wallet.rate.updatedToday', { time })
        : t('finance.wallet.rate.updatedOn', {
            date: formatDate(effective, { day: 'numeric', month: 'long' }, i18n.language),
          });

    return { rate: { value, updated }, staleMessage: null, refetch: rateQuery.refetch };
  }, [i18n.language, rate, rateQuery.refetch, role, t]);
};
