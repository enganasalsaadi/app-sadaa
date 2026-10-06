import { useCallback, useMemo, useState } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/core/i18n';
import type { SegmentedOption } from '@/shared/ui';
import { useGetMediaKitStatsQuery } from '../../../api/mediaKitApi';
import { HOME_STATS_PERIOD } from '../../../hooks/useMediaKitCard';
import { useMediaKitShareActions } from '../../../hooks/useMediaKitShareActions';
import { STATS_PERIODS } from '../../../types/mediaKit';
import type { StatsPeriod } from '../../../types/mediaKit';
import { hasNoActivity } from '../../../utils/mediaKitCard';
import {
  buildInsightsTiles,
  pairTiles,
  toBrandLocationRows,
  toDailyViews,
} from '../../../utils/mediaKitInsights';

const PERIOD_LABEL = {
  '7d': 'account.mediaKit.insightsScreen.periods.7d',
  '30d': 'account.mediaKit.insightsScreen.periods.30d',
  '90d': 'account.mediaKit.insightsScreen.periods.90d',
} as const satisfies Record<StatsPeriod, ParseKeys>;

const PERIOD_COMPARE = {
  '7d': 'account.mediaKit.insightsScreen.compare.7d',
  '30d': 'account.mediaKit.insightsScreen.compare.30d',
  '90d': 'account.mediaKit.insightsScreen.compare.90d',
} as const satisfies Record<StatsPeriod, ParseKeys>;

const RANGE_DATE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
};

export type InsightsStatus = 'loading' | 'error' | 'ready';

/**
 * Media kit stats for one period (contract §17.7). Each period is its own cache
 * entry, so switching back is instant; `currentData` keeps the old period's
 * numbers from showing under the new label while it loads.
 */
export const useMediaKitInsightsScreen = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatsPeriod>(HOME_STATS_PERIOD);
  const [refreshing, setRefreshing] = useState(false);
  const {
    currentData: stats,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMediaKitStatsQuery(period);
  const share = useMediaKitShareActions();

  const periodOptions = useMemo<SegmentedOption<StatsPeriod>[]>(
    () =>
      STATS_PERIODS.map(value => ({ value, label: t(PERIOD_LABEL[value]) })),
    [t],
  );

  const tiles = useMemo(
    () => (stats ? buildInsightsTiles(stats) : []),
    [stats],
  );
  const tileRows = useMemo(() => pairTiles(tiles), [tiles]);
  const locations = useMemo(
    () => (stats ? toBrandLocationRows(stats.brand_locations) : []),
    [stats],
  );

  const dailyViews = useMemo(() => {
    const daily = stats ? toDailyViews(stats) : null;
    return daily
      ? {
          values: daily.values,
          accessibilityLabel: t('account.mediaKit.insightsScreen.daily.a11y', {
            total: formatNumber(daily.total),
            peak: formatNumber(daily.peak),
          }),
        }
      : null;
  }, [stats, t]);

  const rangeLabel = useMemo(
    () =>
      stats
        ? t('account.mediaKit.insightsScreen.range', {
            from: formatDate(new Date(stats.range.from), RANGE_DATE),
            to: formatDate(new Date(stats.range.to), RANGE_DATE),
          })
        : null,
    [stats, t],
  );

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const status: InsightsStatus = stats
    ? 'ready'
    : isError && !isFetching
    ? 'error'
    : 'loading';

  return {
    period,
    periodOptions,
    onPeriodChange: setPeriod,
    status,
    error,
    rangeLabel,
    compareLabel: t(PERIOD_COMPARE[period]),
    tileRows,
    noActivity: hasNoActivity(tiles),
    dailyViews,
    locations,
    topWork: stats?.top_portfolio_items ?? [],
    share,
    refreshing,
    onRefresh,
    onRetry,
  };
};

export type MediaKitInsightsScreenModel = ReturnType<
  typeof useMediaKitInsightsScreen
>;
