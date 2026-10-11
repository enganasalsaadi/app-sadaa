import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import type { MediaKitPortfolioItem } from '../../types/mediaKit';
import { MediaKitRail } from './MediaKitRail';

const TILE_WIDTH = moderateScale(140);
/** Creator media is 4:5 (rule 08). */
const TILE_RATIO = 4 / 5;
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

const WorkTile = memo<{ item: MediaKitPortfolioItem }>(({ item }) => {
  const { t } = useTranslation();
  const { colors, sizes, shadows } = useTheme();
  const styles = useStyles(() => ({
    tile: { ...shadows.card },
    caption: { position: 'absolute' as const, bottom: 0, start: 0, end: 0 },
  }));
  const views = item.views === null ? null : formatNumber(item.views, COMPACT);

  return (
    <Box
      width={TILE_WIDTH}
      borderRadius="lg"
      style={styles.tile}
      accessible
      accessibilityLabel={[item.title, item.brand_name, views && t('account.mediaKit.showcase.work.views', { views })]
        .filter(Boolean)
        .join(t('account.mediaKit.showcase.listSeparator'))}
    >
      <Image
        uri={item.thumbnail_url}
        width={TILE_WIDTH}
        aspectRatio={TILE_RATIO}
        borderRadius="lg"
        resizeMode="cover"
        gradientColors={[colors.layout.transparent, colors.mediaBackdrop]}
      />
      <Box style={styles.caption} p="md" gap="xs">
        {views ? (
          <Box row align="center" gap="xs">
            <Eye size={sizes.icon.xs} color={colors.text.onBrand} />
            <Text variant="caption" color={colors.text.onBrand}>
              {views}
            </Text>
          </Box>
        ) : null}
        {item.brand_name ? (
          <Text variant="bodySmall" color={colors.text.onBrand} numberOfLines={1}>
            {item.brand_name}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
});

/** Featured past work, photo first, with views and the brand it was made for. */
const MediaKitWorkRailComponent: React.FC<{ items: readonly MediaKitPortfolioItem[] }> = ({ items }) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  if (items.length === 0) return null;

  return (
    <MediaKitRail title={t('account.mediaKit.showcase.work.title')} snapInterval={TILE_WIDTH + spacing.md}>
      {items.map(item => (
        <WorkTile key={item.id} item={item} />
      ))}
    </MediaKitRail>
  );
};

export const MediaKitWorkRail = memo(MediaKitWorkRailComponent);
