import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCw } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { AnimatedNumber, Box, LiveDot, Pressable, Text } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
/** A missing number, never shown as 0 (still loading, failed, nothing linked). */
const NO_VALUE = '—';

type Kpis = CreatorHomeScreenModel['kpis'];

const Cell = memo<{ value: string; label: string }>(({ value, label }) => {
  const { colors } = useTheme();
  return (
    <Box
      flex={1}
      gap="xs"
      px="md"
      py="sm"
      borderRadius="lg"
      bg={colors.glass.fill}
      borderWidth="thin"
      borderColor={colors.glass.border}
    >
      {value === NO_VALUE ? (
        <Text variant="title" color={colors.text.onBrandMuted}>
          {value}
        </Text>
      ) : (
        <AnimatedNumber value={value} variant="title" color={colors.text.onBrand} />
      )}
      <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
});

interface HeroPulseProps {
  kpis: Kpis;
  /** Short screens: the period line goes. */
  compact: boolean;
  onOpenInsights: () => void;
}

/**
 * The last 30 days in three glass cells (storefront views, brands that visited, reach across the
 * linked accounts). One tap target: Insights, or a retry when the stats failed. Numbers roll in once.
 */
const HeroPulseComponent: React.FC<HeroPulseProps> = ({ kpis, compact, onOpenInsights }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const failed = kpis.status === 'error';
  const ready = kpis.status === 'ready';
  const views = ready && kpis.views ? formatNumber(kpis.views.value, COMPACT) : NO_VALUE;
  const brands = ready && kpis.brandViews ? formatNumber(kpis.brandViews.value, COMPACT) : NO_VALUE;
  const reach = !kpis.reachLoading && kpis.reach !== null ? formatNumber(kpis.reach, COMPACT) : NO_VALUE;

  return (
    <Pressable
      gap="sm"
      onPress={failed ? kpis.retry : onOpenInsights}
      accessibilityRole="button"
      accessibilityLabel={
        failed
          ? t('marketplace.creatorHome.kpi.retry')
          : t('marketplace.creatorHome.hero.pulse.a11y', { views, brands, reach })
      }
    >
      <Box row gap="sm">
        <Cell value={views} label={t('marketplace.creatorHome.hero.pulse.views')} />
        <Cell value={brands} label={t('marketplace.creatorHome.hero.pulse.brands')} />
        <Cell value={reach} label={t('marketplace.creatorHome.hero.pulse.reach')} />
      </Box>
      {failed ? (
        <Box row align="center" gap="xs">
          <RotateCw size={sizes.icon.xs} color={colors.text.onBrandMuted} />
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
            {t('marketplace.creatorHome.kpi.failed')}
          </Text>
        </Box>
      ) : compact ? null : (
        <Box row align="center" gap="xs">
          <LiveDot color={colors.glass.iconMoney} />
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.creatorHome.hero.pulse.period')}
          </Text>
        </Box>
      )}
    </Pressable>
  );
};

export const HeroPulse = memo(HeroPulseComponent);
