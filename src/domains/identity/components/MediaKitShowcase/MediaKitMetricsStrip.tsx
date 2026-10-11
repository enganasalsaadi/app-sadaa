import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Text } from '@/shared/ui';
import type { ShowcaseMetric, ShowcaseMetricKey } from '../../utils/mediaKitShowcase';

const METRIC_LABEL = {
  reach: 'account.mediaKit.showcase.metrics.reach',
  engagement: 'account.mediaKit.showcase.metrics.engagement',
  avgViews: 'account.mediaKit.showcase.metrics.avgViews',
  localAudience: 'account.mediaKit.showcase.metrics.localAudience',
  campaigns: 'account.mediaKit.showcase.metrics.campaigns',
  fastestDelivery: 'account.mediaKit.showcase.metrics.fastestDelivery',
  platforms: 'account.mediaKit.showcase.metrics.platforms',
} as const satisfies Record<ShowcaseMetricKey, ParseKeys>;

/** Four cells need the smaller figure to fit a 320pt phone. */
const ROOMY_MAX = 3;

interface MediaKitMetricsStripProps {
  metrics: readonly ShowcaseMetric[];
  compact: boolean;
}

/**
 * Glass strip of the creator's headline numbers on navy. Each figure rolls up once
 * (rule 09 §3.1); only metrics the server sent are shown, never a placeholder 0.
 */
const MediaKitMetricsStripComponent: React.FC<MediaKitMetricsStripProps> = ({ metrics, compact }) => {
  const { t } = useTranslation();
  const { colors, sizes, borderWidths } = useTheme();
  if (metrics.length === 0) return null;

  const variant = compact || metrics.length > ROOMY_MAX ? 'title' : 'h4';
  const summary = metrics
    .map(m => t('account.mediaKit.showcase.metrics.a11yItem', { label: t(METRIC_LABEL[m.key]), value: m.value }))
    .join(t('account.mediaKit.showcase.listSeparator'));

  return (
    <Box
      row
      align="center"
      px="sm"
      py={compact ? 'sm' : 'md'}
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.fill}
      accessible
      accessibilityLabel={summary}
    >
      {metrics.map((metric, index) => (
        <React.Fragment key={metric.key}>
          {index > 0 ? (
            <Box width={borderWidths.thin} height={sizes.icon.lg} bg={colors.glass.border} />
          ) : null}
          <Box flex={1} align="center" gap="xs" px="xs">
            <AnimatedNumber value={metric.value} variant={variant} color={colors.text.onBrand} />
            <Text
              variant="caption"
              color={colors.text.onBrandMuted}
              numberOfLines={1}
              align="center"
            >
              {t(METRIC_LABEL[metric.key])}
            </Text>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export const MediaKitMetricsStrip = memo(MediaKitMetricsStripComponent);
