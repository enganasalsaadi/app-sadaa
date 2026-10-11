import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  GalleryModal,
  Image,
  Pressable,
  SocialPlatformIcon,
  Text,
} from '@/shared/ui';
import type { MediaKitPortfolioItem } from '../../types/mediaKit';
import { MediaKitRise } from './MediaKitRise';
import { MediaKitSectionTitle } from './MediaKitSectionTitle';

/** Tiles shown before "See all" opens the rest in place. */
const MAX_COLLAPSED = 4;
const COMPACT: Intl.NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 1,
};
/** Tall / short heights alternate, mirrored between the columns, so the grid staggers. */
const TALL = moderateScale(220);
const SHORT = moderateScale(168);
const BADGE = moderateScale(30);
const BADGE_LOGO = moderateScale(18);
const TILE_STAGGER = 80;
const COLUMN_KEYS = ['start', 'end'] as const;

interface TileProps {
  item: MediaKitPortfolioItem;
  index: number;
  height: number;
  onOpen: (index: number) => void;
}

const WorkTile = memo<TileProps>(({ item, index, height, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ spacing }) => ({
      badge: {
        position: 'absolute' as const,
        top: spacing.sm,
        start: spacing.sm,
      },
      caption: { position: 'absolute' as const, bottom: 0, start: 0, end: 0 },
    }),
    [],
  );
  const open = useCallback(() => onOpen(index), [index, onOpen]);
  const views = item.views === null ? null : formatNumber(item.views, COMPACT);
  const label = [
    item.title,
    item.brand_name,
    views && t('account.mediaKit.showcase.work.views', { views }),
  ]
    .filter(Boolean)
    .join(t('account.mediaKit.showcase.listSeparator'));

  return (
    <MediaKitRise delay={index * TILE_STAGGER}>
      <Pressable
        onPress={open}
        scaleOnPress
        height={height}
        borderRadius="xl"
        shadow="card"
        bg={colors.brand.main}
        accessibilityRole="imagebutton"
        accessibilityLabel={label || t('account.mediaKit.showcase.work.open')}
      >
        {/* Clipping on an inner layer keeps the outer shadow on iOS. */}
        <Box flex={1} borderRadius="xl" overflow="hidden">
          <Image
            uri={item.thumbnail_url}
            width="100%"
            height="100%"
            resizeMode="cover"
            containerStyle={StyleSheet.absoluteFill}
            gradient={{
              colors: colors.gradients.mediaScrim.colors,
              locations: colors.gradients.mediaScrim.locations,
            }}
          />
          {item.platform && isSocialPlatform(item.platform) ? (
            <Box
              style={styles.badge}
              width={BADGE}
              height={BADGE}
              borderRadius="sm"
              bg={colors.surface.main}
              align="center"
              justify="center"
            >
              <SocialPlatformIcon
                platform={item.platform}
                size={BADGE_LOGO}
                color={colors.text.primary}
              />
            </Box>
          ) : null}
          <Box style={styles.caption} p="md" gap="xs">
            {item.title ? (
              <Text
                variant="buttonSmall"
                color={colors.text.onBrand}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            ) : null}
            {views || item.brand_name ? (
              <Box row align="center" gap="xs">
                {views ? (
                  <>
                    <Eye size={sizes.icon.xs} color={colors.text.onBrand} />
                    <Text variant="caption" color={colors.text.onBrand}>
                      {views}
                    </Text>
                  </>
                ) : null}
                {views && item.brand_name ? (
                  <Text variant="caption" color={colors.text.onBrandMuted}>
                    {t('account.mediaKit.showcase.services.termsSeparator')}
                  </Text>
                ) : null}
                {item.brand_name ? (
                  <Box flex={1}>
                    <Text
                      variant="caption"
                      color={colors.text.onBrand}
                      numberOfLines={1}
                    >
                      {item.brand_name}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Pressable>
    </MediaKitRise>
  );
});

/**
 * "Their work": past posts as a two-column masonry (tall and short tiles crossing), photo
 * first with platform, views and brand on a scrim. Four show; "See all" opens the rest in
 * place. A tap opens the photos full screen.
 */
const MediaKitWorkMasonryComponent: React.FC<{
  items: readonly MediaKitPortfolioItem[];
}> = ({ items }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const shown = expanded ? items : items.slice(0, MAX_COLLAPSED);
  const images = useMemo(() => items.map(item => item.thumbnail_url), [items]);

  const columns = useMemo(() => {
    const cols: {
      item: MediaKitPortfolioItem;
      index: number;
      height: number;
    }[][] = [[], []];
    shown.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      // Column 0 starts tall, column 1 starts short; each then alternates.
      const tall = (row + column) % 2 === 0;
      cols[column]?.push({ item, index, height: tall ? TALL : SHORT });
    });
    return cols;
  }, [shown]);

  const onOpen = useCallback((index: number) => setViewer(index), []);
  const onClose = useCallback(() => setViewer(null), []);
  const toggle = useCallback(() => setExpanded(prev => !prev), []);

  if (items.length === 0) return null;

  const hasMore = items.length > MAX_COLLAPSED;

  return (
    <Box gap="lg">
      <MediaKitSectionTitle
        overline={t('account.mediaKit.showcase.work.overline')}
        title={t('account.mediaKit.showcase.work.title')}
        action={
          hasMore
            ? {
                label: expanded
                  ? t('account.mediaKit.showcase.work.seeLess')
                  : t('account.mediaKit.showcase.work.seeAll', {
                      count: items.length,
                    }),
                onPress: toggle,
              }
            : undefined
        }
      />
      <Box row gap="md" align="flex-start">
        {columns.map((column, columnIndex) => (
          <Box key={COLUMN_KEYS[columnIndex]} flex={1} gap="md">
            {column.map(cell => (
              <WorkTile
                key={cell.item.id}
                item={cell.item}
                index={cell.index}
                height={cell.height}
                onOpen={onOpen}
              />
            ))}
          </Box>
        ))}
      </Box>
      <GalleryModal
        images={images}
        visible={viewer !== null}
        initialIndex={viewer ?? 0}
        onClose={onClose}
      />
    </Box>
  );
};

export const MediaKitWorkMasonry = memo(MediaKitWorkMasonryComponent);
