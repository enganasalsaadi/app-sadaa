import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, RotateCw, TrendingDown, TrendingUp } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Skeleton, Text } from '@/shared/ui';
import type { MediaKitTile } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
/** A missing number, never shown as 0 (failed load, metric not live, no follower counts). */
const NO_VALUE = '—';

type Kpis = CreatorHomeScreenModel['kpis'];
type Change = MediaKitTile['change'];

interface KpiCellProps {
  label: string;
  value: string;
  loading: boolean;
  compact: boolean;
  change?: Change;
}

const ChangeChip = memo<{ change: Exclude<Change, undefined> }>(({ change }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (change === 'new') {
    return (
      <Text variant="caption" color={colors.glass.iconInteractive}>
        {t('marketplace.creatorHome.kpi.new')}
      </Text>
    );
  }
  const Trend = change < 0 ? TrendingDown : TrendingUp;
  return (
    <Box row align="center" gap="xs">
      <Trend size={sizes.icon.xs} color={change < 0 ? colors.text.onBrandMuted : colors.glass.iconInteractive} />
      <Text variant="caption" color={colors.text.onBrand}>
        {formatNumber(Math.abs(change), PERCENT)}
      </Text>
    </Box>
  );
});

const KpiCell = memo<KpiCellProps>(({ label, value, loading, compact, change }) => {
  const { colors, typography } = useTheme();
  const variant = compact ? 'title' : 'h4';
  return (
    <Box flex={1} align="center" gap="xs">
      {loading ? (
        <Skeleton width="60%" height={typography[variant].lineHeight} borderRadius="sm" surface="brand" />
      ) : (
        <Box row align="center" gap="xs">
          <Text variant={variant} color={colors.text.onBrand} numberOfLines={1}>
            {value}
          </Text>
          {change !== undefined && !compact ? <ChangeChip change={change} /> : null}
        </Box>
      )}
      <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1} align="center">
        {label}
      </Text>
    </Box>
  );
});

const metricValue = (tile: { value: number } | null, failed: boolean): string =>
  tile && !failed ? formatNumber(tile.value, COMPACT) : NO_VALUE;

interface HeroKpiStripProps {
  kpis: Kpis;
  compact: boolean;
  onOpenInsights: () => void;
}

/**
 * Glass strip of the last 30 days: reach, profile views (with change), brand views.
 * One tap target: opens Insights, or retries when the stats failed to load.
 */
const HeroKpiStripComponent: React.FC<HeroKpiStripProps> = ({ kpis, compact, onOpenInsights }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL, borderWidths } = useTheme();
  const failed = kpis.status === 'error';
  const statsLoading = kpis.status === 'loading';
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const reach = kpis.reach === null ? NO_VALUE : formatNumber(kpis.reach, COMPACT);
  const views = metricValue(kpis.views, failed);
  const brands = metricValue(kpis.brandViews, failed);

  const divider = (
    <Box width={borderWidths.thin} height={sizes.icon.lg} bg={colors.glass.border} />
  );

  return (
    <Pressable
      onPress={failed ? kpis.retry : onOpenInsights}
      scaleOnPress
      gap="sm"
      px="md"
      py="md"
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.fill}
      accessibilityRole="button"
      accessibilityLabel={
        failed
          ? t('marketplace.creatorHome.kpi.retry')
          : t('marketplace.creatorHome.kpi.a11y', { reach, views, brands })
      }
    >
      {compact ? null : (
        <Box row align="center" justify="space-between" px="xs">
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
            {t(failed ? 'marketplace.creatorHome.kpi.failed' : 'marketplace.creatorHome.kpi.period')}
          </Text>
          {failed ? (
            <RotateCw size={sizes.icon.xs} color={colors.text.onBrandMuted} />
          ) : (
            <Chevron size={sizes.icon.sm} color={colors.text.onBrandMuted} />
          )}
        </Box>
      )}
      <Box row align="center">
        <KpiCell
          label={t('marketplace.creatorHome.kpi.reach')}
          value={reach}
          loading={kpis.reachLoading}
          compact={compact}
        />
        {divider}
        <KpiCell
          label={t('marketplace.creatorHome.kpi.views')}
          value={views}
          loading={statsLoading}
          compact={compact}
          change={failed ? undefined : kpis.views?.change}
        />
        {divider}
        <KpiCell
          label={t('marketplace.creatorHome.kpi.brands')}
          value={brands}
          loading={statsLoading}
          compact={compact}
        />
      </Box>
    </Pressable>
  );
};

export const HeroKpiStrip = memo(HeroKpiStripComponent);
