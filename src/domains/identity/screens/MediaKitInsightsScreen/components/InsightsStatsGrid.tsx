import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Eye,
  Handshake,
  MousePointerClick,
  Search,
  Share2,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Notice, StatTile, Text } from '@/shared/ui';
import type {
  InsightsTile,
  InsightsTileKey,
} from '../../../utils/mediaKitInsights';

const TILE_LABEL = {
  profile_views: 'account.mediaKit.tiles.views',
  unique_brand_views: 'account.mediaKit.tiles.brands',
  link_opens: 'account.mediaKit.tiles.linkOpens',
  shares: 'account.mediaKit.tiles.shares',
  search_impressions: 'account.mediaKit.tiles.searchImpressions',
  offers_from_profile: 'account.mediaKit.tiles.offers',
} as const satisfies Record<InsightsTileKey, ParseKeys>;

const TILE_ICON = {
  profile_views: Eye,
  unique_brand_views: Building2,
  link_opens: MousePointerClick,
  shares: Share2,
  search_impressions: Search,
  offers_from_profile: Handshake,
} as const satisfies Record<InsightsTileKey, LucideIcon>;

/** The four metrics that are always live (§17.7) hold the grid's height while loading. */
const SKELETON_ROWS: readonly (readonly InsightsTileKey[])[] = [
  ['profile_views', 'unique_brand_views'],
  ['link_opens', 'shares'],
];

const COMPACT: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};

interface InsightsStatsGridProps {
  loading: boolean;
  rows: readonly (readonly InsightsTile[])[];
  rangeLabel: string | null;
  compareLabel: string;
  noActivity: boolean;
}

const InsightsStatsGridComponent: React.FC<InsightsStatsGridProps> = ({
  loading,
  rows,
  rangeLabel,
  compareLabel,
  noActivity,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (loading) {
    return (
      <Box gap="sm">
        {SKELETON_ROWS.map(row => (
          <Box key={row.join()} row gap="sm">
            {row.map(key => (
              <StatTile key={key} label={t(TILE_LABEL[key])} value="" loading />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box gap="sm">
      <Box gap="xs">
        {rangeLabel ? (
          <Text variant="bodySmall" color={colors.text.primary}>
            {rangeLabel}
          </Text>
        ) : null}
        <Text variant="caption" color={colors.text.secondary}>
          {compareLabel}
        </Text>
      </Box>
      {noActivity ? (
        <Notice tone="info" message={t('account.mediaKit.noActivity')} />
      ) : null}
      {rows.map(row => (
        <Box key={row.map(tile => tile.key).join()} row gap="sm">
          {row.map(tile => (
            <StatTile
              key={tile.key}
              icon={TILE_ICON[tile.key]}
              label={t(TILE_LABEL[tile.key])}
              value={formatNumber(tile.value, COMPACT)}
              change={tile.change}
            />
          ))}
          {row.length === 1 ? <Box flex={1} /> : null}
        </Box>
      ))}
    </Box>
  );
};

export const InsightsStatsGrid = memo(InsightsStatsGridComponent);
