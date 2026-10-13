import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, RotateCw, TrendingDown, TrendingUp } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Card, Pressable, Skeleton, Sparkline, Text } from '@/shared/ui';
import type { MediaKitTile } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
/** A missing number, never shown as 0 (failed load, metric not live). */
const NO_VALUE = '—';
const PULSE_HEIGHT = moderateScale(40);

type Kpis = CreatorHomeScreenModel['kpis'];
type Change = MediaKitTile['change'];

const ChangeChip = memo<{ change: Exclude<Change, undefined> }>(({ change }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (change === 'new') {
    return (
      <Text variant="caption" color={colors.interactive.text}>
        {t('marketplace.creatorHome.kpi.new')}
      </Text>
    );
  }
  const Trend = change < 0 ? TrendingDown : TrendingUp;
  const tint = change < 0 ? colors.text.secondary : colors.interactive.text;
  return (
    <Box row align="center" gap="xs">
      <Trend size={sizes.icon.xs} color={tint} />
      <Text variant="caption" color={tint}>
        {formatNumber(Math.abs(change), PERCENT)}
      </Text>
    </Box>
  );
});

interface WatchCellProps {
  value: string;
  label: string;
  loading: boolean;
  change?: Change;
  children?: React.ReactNode;
}

const WatchCell = memo<WatchCellProps>(({ value, label, loading, change, children }) => {
  const { colors, typography } = useTheme();
  return (
    <Box flex={1} gap="xs" p="md" borderRadius="lg" bg={colors.layout.base} overflow="hidden">
      {loading ? (
        <Skeleton width="55%" height={typography.h2.lineHeight} borderRadius="xs" />
      ) : value === NO_VALUE ? (
        <Text variant="h2" color={colors.text.tertiary}>
          {value}
        </Text>
      ) : (
        <AnimatedNumber value={value} variant="h2" />
      )}
      <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
        {label}
      </Text>
      {change !== undefined && !loading ? <ChangeChip change={change} /> : null}
      {children}
    </Box>
  );
});

const metricValue = (tile: { value: number } | null, failed: boolean): string =>
  tile && !failed ? formatNumber(tile.value, COMPACT) : NO_VALUE;

interface WatchGridProps {
  kpis: Kpis;
  onOpenInsights: () => void;
}

/**
 * "Who's looking?": the body's opening card (kept out of the hero so it never slides away
 * half read). The last 30 days as two panes, brands that opened the storefront and profile
 * views with their daily pulse (the real series) along the bottom. One tap target: Insights,
 * or a retry when the stats failed. Numbers roll in once.
 */
const WatchGridComponent: React.FC<WatchGridProps> = ({ kpis, onOpenInsights }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const failed = kpis.status === 'error';
  const loading = kpis.status === 'loading';
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const brands = metricValue(kpis.brandViews, failed);
  const views = metricValue(kpis.views, failed);
  const showPulse = !failed && kpis.viewsSeries.length > 1;

  return (
    <Pressable
      onPress={failed ? kpis.retry : onOpenInsights}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={
        failed
          ? t('marketplace.creatorHome.kpi.retry')
          : t('marketplace.creatorHome.storefront.watch.a11y', { brands, views })
      }
    >
      <Card p="lg">
        <Box gap="md">
          <Box row align="center" justify="space-between" gap="sm">
            <Box row align="baseline" gap="sm" flex={1}>
              <Text variant="title" numberOfLines={1}>
                {t('marketplace.creatorHome.storefront.watch.title')}
              </Text>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {t(failed ? 'marketplace.creatorHome.kpi.failed' : 'marketplace.creatorHome.storefront.watch.period')}
              </Text>
            </Box>
            {failed ? (
              <RotateCw size={sizes.icon.sm} color={colors.text.secondary} />
            ) : (
              <Chevron size={sizes.icon.sm} color={colors.text.secondary} />
            )}
          </Box>
          <Box row gap="md">
            <WatchCell
              value={brands}
              label={t('marketplace.creatorHome.storefront.watch.brands')}
              loading={loading}
              change={failed ? undefined : kpis.brandViews?.change}
            />
            <WatchCell
              value={views}
              label={t('marketplace.creatorHome.storefront.watch.views')}
              loading={loading}
              change={failed ? undefined : kpis.views?.change}
            >
              {showPulse ? (
                <Box pt="xs">
                  <Sparkline
                    values={kpis.viewsSeries}
                    tone="interactive"
                    height={PULSE_HEIGHT}
                    accessibilityLabel={t('marketplace.creatorHome.storefront.watch.pulseA11y')}
                  />
                </Box>
              ) : null}
            </WatchCell>
          </Box>
        </Box>
      </Card>
    </Pressable>
  );
};

export const WatchGrid = memo(WatchGridComponent);
