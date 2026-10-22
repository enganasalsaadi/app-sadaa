import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Compass,
  IdCard,
  Inbox,
  Layers,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme, type HueColors } from '@/core/theme';
import { Badge, Box, MoneyText, Pressable, SectionHeader, Text } from '@/shared/ui';
import type { HomeMapTile, HomeMapTileKey } from '../hooks/useHomeMap';

const TILE_MIN_HEIGHT = moderateScale(108);
const BADGE_TOP = moderateScale(8);
const BADGE_END = moderateScale(10);
const WIDE_MIN_HEIGHT = moderateScale(76);
const MARK = moderateScale(44);

type TileHue = 'brand' | 'interactive' | 'money';

const TILE_DEF = {
  offers: { icon: Inbox, titleKey: 'marketplace.creatorHome.map.offers', hue: 'interactive' },
  deals: { icon: BriefcaseBusiness, titleKey: 'marketplace.creatorHome.map.deals', hue: 'brand' },
  campaigns: { icon: Compass, titleKey: 'marketplace.creatorHome.map.campaigns', hue: 'brand' },
  notifications: { icon: Bell, titleKey: 'marketplace.creatorHome.map.notifications', hue: 'brand' },
  wallet: { icon: Wallet, titleKey: 'marketplace.creatorHome.map.wallet', hue: 'money' },
  rates: { icon: Tag, titleKey: 'marketplace.creatorHome.map.rates', hue: 'brand' },
  platforms: { icon: Layers, titleKey: 'marketplace.creatorHome.map.platforms', hue: 'brand' },
  kit: { icon: IdCard, titleKey: 'marketplace.creatorHome.map.kit', hue: 'brand' },
  insights: { icon: ChartLine, titleKey: 'marketplace.creatorHome.map.insights', hue: 'brand' },
} as const satisfies Record<HomeMapTileKey, { icon: LucideIcon; titleKey: ParseKeys; hue: TileHue }>;

/** Tiles of the last row run wide: icon beside the words, a chevron at the end. */
const ROWS = [3, 3, 2] as const;

const useHue = (tile: HomeMapTile): HueColors => {
  const { colors } = useTheme();
  if (tile.sub.kind === 'text' && tile.sub.tone === 'warning') return colors.status.warning;
  return colors[TILE_DEF[tile.key].hue];
};

const Sub = memo<{ tile: HomeMapTile; hidden: boolean; wide: boolean }>(({ tile, hidden, wide }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { sub } = tile;
  switch (sub.kind) {
    case 'loading':
      return (
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.creatorHome.map.sub.loading')}
        </Text>
      );
    case 'money':
      return <MoneyText value={sub.value} size="sm" tone="money" hidden={hidden} rounding="down" />;
    case 'text':
      return (
        <Text
          variant="caption"
          align={wide ? undefined : 'center'}
          color={sub.tone === 'warning' ? colors.status.warning.text : colors.text.tertiary}
          numberOfLines={1}
        >
          {sub.text}
        </Text>
      );
    default: {
      const _exhaustive: never = sub;
      return _exhaustive;
    }
  }
});

const MapTile = memo<{ tile: HomeMapTile; wide: boolean; hidden: boolean }>(({ tile, wide, hidden }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(() => ({
    badge: { position: 'absolute' as const, top: BADGE_TOP, end: BADGE_END },
  }));
  const def = TILE_DEF[tile.key];
  const hue = useHue(tile);
  const Icon = def.icon;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const title = t(def.titleKey);
  const label =
    tile.sub.kind === 'text' ? t('marketplace.creatorHome.map.tileA11y', { title, sub: tile.sub.text }) : title;

  return (
    <Pressable
      flex={1}
      row={wide}
      align="center"
      gap={wide ? 'md' : 'xs'}
      p={wide ? 'lg' : 'md'}
      minHeight={wide ? WIDE_MIN_HEIGHT : TILE_MIN_HEIGHT}
      borderRadius="lg"
      bg={colors.surface.main}
      shadow="card"
      onPress={tile.onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Box width={MARK} height={MARK} borderRadius="md" bg={hue.soft} align="center" justify="center">
        <Icon size={sizes.icon.md} color={hue.text} strokeWidth={iconStroke.regular} />
      </Box>
      <Box flex={wide ? 1 : undefined} align={wide ? 'flex-start' : 'center'} gap="xs">
        <Text variant="buttonSmall" numberOfLines={1}>
          {title}
        </Text>
        <Sub tile={tile} hidden={hidden} wide={wide} />
      </Box>
      {wide ? <Chevron size={sizes.icon.sm} color={colors.text.tertiary} /> : null}
      {tile.badge > 0 ? (
        <Box style={styles.badge} pointerEvents="none">
          <Badge count={tile.badge} tone={tile.key === 'campaigns' ? 'interactive' : 'danger'} />
        </Box>
      ) : null}
    </Pressable>
  );
});

interface SadaMapProps {
  tiles: readonly HomeMapTile[];
  /** Live withdrawal strikes; the red bar under the map shows only above 0. */
  strikes: number;
  onOpenStrikes: () => void;
  amountsHidden: boolean;
}

/** Every place a creator goes from Home, so nobody gets lost: 3 · 3 · 2 tiles, then any live strike. */
const SadaMapComponent: React.FC<SadaMapProps> = ({ tiles, strikes, onOpenStrikes, amountsHidden }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  let from = 0;
  const rows = ROWS.map(size => {
    const row = tiles.slice(from, from + size);
    from += size;
    return row;
  });

  return (
    <Box px="xl" gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.map.title')}
        subtitle={t('marketplace.creatorHome.map.subtitle')}
        emphasis="strong"
      />
      {rows.map((row, index) => (
        <Box key={ROWS.slice(0, index + 1).join('-')} row gap="md">
          {row.map(tile => (
            <MapTile key={tile.key} tile={tile} wide={row.length === 2} hidden={amountsHidden} />
          ))}
        </Box>
      ))}
      {strikes > 0 ? (
        <Pressable
          row
          align="center"
          gap="md"
          px="lg"
          minHeight={sizes.button.md}
          borderRadius="lg"
          bg={colors.status.danger.soft}
          onPress={onOpenStrikes}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.strikes.active', { count: strikes })}
        >
          <AlertCircle size={sizes.icon.sm} color={colors.status.danger.main} />
          <Box flex={1}>
            <Text variant="buttonSmall" color={colors.status.danger.text} numberOfLines={2}>
              {t('marketplace.creatorHome.strikes.active', { count: strikes })}
            </Text>
          </Box>
          <Chevron size={sizes.icon.sm} color={colors.status.danger.text} />
        </Pressable>
      ) : null}
    </Box>
  );
};

export const SadaMap = memo(SadaMapComponent);
