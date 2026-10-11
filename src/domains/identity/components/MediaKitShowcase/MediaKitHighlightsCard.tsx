import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader, StatTile } from '@/shared/ui';
import type { ShowcaseMetric, ShowcaseMetricKey } from '../../utils/mediaKitShowcase';

const METRIC_LABEL = {
  engagement: 'account.mediaKit.showcase.metrics.engagement',
  avgViews: 'account.mediaKit.showcase.metrics.avgViews',
  localAudience: 'account.mediaKit.showcase.metrics.localAudience',
  campaigns: 'account.mediaKit.showcase.metrics.campaigns',
} as const satisfies Record<ShowcaseMetricKey, ParseKeys>;

/** StatTiles go in rows of two. */
const PER_ROW = 2;

/**
 * The server's highlight numbers (contract §17.11) as stat tiles, two per row. Only metrics the
 * server sent; the section stays out until there is at least one.
 */
const MediaKitHighlightsCardComponent: React.FC<{ metrics: readonly ShowcaseMetric[] }> = ({ metrics }) => {
  const { t } = useTranslation();
  if (metrics.length === 0) return null;

  const rows: ShowcaseMetric[][] = [];
  for (let i = 0; i < metrics.length; i += PER_ROW) rows.push(metrics.slice(i, i + PER_ROW));

  return (
    <Box px="xl" gap="md">
      <SectionHeader title={t('account.mediaKit.showcase.metrics.title')} emphasis="strong" />
      {rows.map(row => (
        <Box key={row.map(metric => metric.key).join()} row gap="md">
          {row.map(metric => (
            <StatTile key={metric.key} label={t(METRIC_LABEL[metric.key])} value={metric.value} />
          ))}
          {row.length < PER_ROW ? <Box flex={1} /> : null}
        </Box>
      ))}
    </Box>
  );
};

export const MediaKitHighlightsCard = memo(MediaKitHighlightsCardComponent);
