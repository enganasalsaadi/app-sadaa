import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney } from '@/core/i18n';
import type { BarChartDatum } from '@/shared/ui';
import { MOCK_MONTHLY_EARNINGS, MOCK_MONTHLY_SPEND } from '../mockData';

/** The demo series end on October 2026 (month index 9). */
const LAST_YEAR = 2026;
const LAST_MONTH = 9;

const toSeries = (cents: readonly number[], lang: string): BarChartDatum[] =>
  cents.map((amount, index) => {
    const date = new Date(LAST_YEAR, LAST_MONTH - (cents.length - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: formatDate(date, { month: 'short' }, lang),
      value: amount,
    };
  });

export const useBarChartDemo = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    const earnings = toSeries(MOCK_MONTHLY_EARNINGS, lang);
    const spend = toSeries(MOCK_MONTHLY_SPEND, lang);
    const lastValue = (series: BarChartDatum[]) => series[series.length - 1]?.value ?? 0;
    return {
      earnings,
      earningsBubble: formatMoney({ amount: lastValue(earnings), currency: 'USD' }, lang, {
        precision: 0,
        rounding: 'down',
      }),
      spend,
      spendBubble: formatMoney({ amount: lastValue(spend), currency: 'USD' }, lang, { precision: 0 }),
      zeros: earnings.map(datum => ({ ...datum, value: 0 })),
    };
  }, [lang]);
};
