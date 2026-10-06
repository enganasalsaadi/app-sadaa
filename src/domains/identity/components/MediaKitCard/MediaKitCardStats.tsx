import React, { memo, useMemo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Building2, Eye, Handshake, MousePointerClick } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Notice, StatTile, Text } from '@/shared/ui';
import { hasNoActivity, splitTileRows } from '../../utils/mediaKitCard';
import type { MediaKitTile, MediaKitTileKey } from '../../utils/mediaKitCard';
import type { MediaKitCardStats as MediaKitCardStatsModel } from './types';

const TILE_LABEL = {
  profile_views: 'account.mediaKit.tiles.views',
  unique_brand_views: 'account.mediaKit.tiles.brands',
  link_opens: 'account.mediaKit.tiles.linkOpens',
  offers_from_profile: 'account.mediaKit.tiles.offers',
} as const satisfies Record<MediaKitTileKey, ParseKeys>;

const TILE_ICON = {
  profile_views: Eye,
  unique_brand_views: Building2,
  link_opens: MousePointerClick,
  offers_from_profile: Handshake,
} as const satisfies Record<MediaKitTileKey, LucideIcon>;

/** Placeholder tiles keep the card height steady while stats load. */
const SKELETON_TILES: readonly MediaKitTileKey[] = [
  'profile_views',
  'unique_brand_views',
  'link_opens',
];

interface MediaKitCardStatsProps extends MediaKitCardStatsModel {
  onRetry: () => void;
}

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

/** The last-30-days tiles. Inline error and loading stay inside the card (plan §States). */
const MediaKitCardStatsComponent: React.FC<MediaKitCardStatsProps> = ({ status, tiles, onRetry }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const rows = useMemo(() => splitTileRows(tiles), [tiles]);

  if (status === 'error') {
    return (
      <Notice
        tone="danger"
        message={t('account.mediaKit.statsFailed')}
        action={{ label: t('account.mediaKit.retry'), onPress: onRetry }}
      />
    );
  }

  if (status === 'loading') {
    return (
      <Box row gap="sm">
        {SKELETON_TILES.map(key => (
          <StatTile key={key} label={t(TILE_LABEL[key])} value="" loading />
        ))}
      </Box>
    );
  }

  if (hasNoActivity(tiles)) {
    return (
      <Box p="md" borderRadius="lg" bg={colors.surface.elevated}>
        <Text variant="bodySmall" color={colors.text.secondary} align="center">
          {t('account.mediaKit.noActivity')}
        </Text>
      </Box>
    );
  }

  return (
    <Box gap="sm">
      <Text variant="caption" color={colors.text.secondary}>
        {t('account.mediaKit.period')}
      </Text>
      {rows.map(row => (
        <Box key={row.map((tile: MediaKitTile) => tile.key).join()} row gap="sm">
          {row.map(tile => (
            <StatTile
              key={tile.key}
              icon={TILE_ICON[tile.key]}
              label={t(TILE_LABEL[tile.key])}
              value={formatNumber(tile.value, COMPACT)}
              change={tile.change}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const MediaKitCardStats = memo(MediaKitCardStatsComponent);
