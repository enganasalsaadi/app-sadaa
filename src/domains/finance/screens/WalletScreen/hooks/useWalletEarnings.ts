import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { formatDate, formatMoney } from '@/core/i18n';
import type { BarChartDatum, SegmentedOption } from '@/shared/ui';
import { useGetWalletEarningsQuery } from '../../../api/walletApi';
import { WALLET_ROLE_COPY } from '../../../constants';
import type { EarningsPeriod, WalletRole } from '../../../types';
import { parseBucketMonth } from '../../../utils/walletDates';

/**
 * `initial`: first load, nothing drawn (the card may never apply) · `hidden`: no endpoint
 * yet or nothing earned / spent · `loading`: switching period.
 */
export type EarningsSectionStatus = 'initial' | 'hidden' | 'loading' | 'error' | 'ready';

const NOT_FOUND = 404;
const DEFAULT_PERIOD: EarningsPeriod = '6m';

/** Monthly bars: creator earnings (mint) · brand campaign spend (neutral). */
export const useWalletEarnings = (role: WalletRole) => {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<EarningsPeriod>(DEFAULT_PERIOD);
  const query = useGetWalletEarningsQuery(period);
  const { currentData, data, isError, error, refetch } = query;
  const copy = WALLET_ROLE_COPY[role];

  const periodOptions = useMemo<SegmentedOption<EarningsPeriod>[]>(
    () => [
      { value: '6m', label: t('finance.wallet.earnings.period6m') },
      { value: '12m', label: t('finance.wallet.earnings.period12m') },
    ],
    [t],
  );

  const chart = useMemo(() => {
    if (!currentData) return null;
    const bars: BarChartDatum[] = currentData.buckets.map(bucket => {
      const month = parseBucketMonth(bucket.month);
      return {
        key: bucket.month,
        label: month ? formatDate(month, { month: 'short' }, i18n.language) : bucket.month,
        value: bucket.amount.amount,
      };
    });
    const currentIndex = currentData.buckets.findIndex(
      bucket => bucket.month === currentData.current_month,
    );
    const current = currentData.buckets[currentIndex];
    return {
      bars,
      highlightIndex: currentIndex >= 0 ? currentIndex : undefined,
      bubble: current
        ? formatMoney(current.amount, i18n.language, { precision: 0, rounding: 'down' })
        : undefined,
      total: currentData.total,
      isEmpty: currentData.total.amount === 0 && bars.every(bar => bar.value === 0),
      accessibilityLabel: t(copy.earningsA11y, { total: formatMoney(currentData.total, i18n.language) }),
    };
  }, [copy.earningsA11y, currentData, i18n.language, t]);

  const notDeployed = isError && normalizeApiError(error).statusCode === NOT_FOUND;
  const status: EarningsSectionStatus = notDeployed
    ? 'hidden'
    : chart
      ? chart.isEmpty && period === DEFAULT_PERIOD
        ? 'hidden'
        : 'ready'
      : isError
        ? 'error'
        : data === undefined
          ? 'initial'
          : 'loading';

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    status,
    title: t(copy.earningsTitle),
    tone: role === 'creator' ? ('money' as const) : ('neutral' as const),
    period,
    periodOptions,
    setPeriod,
    chart,
    retry,
    refetch,
  };
};

export type WalletEarningsModel = ReturnType<typeof useWalletEarnings>;
