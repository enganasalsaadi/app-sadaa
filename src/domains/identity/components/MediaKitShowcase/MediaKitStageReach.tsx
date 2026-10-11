import React, { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { AnimatedNumber, Box, SocialPlatformIcon, Text } from '@/shared/ui';
import type { MediaKitPlatform } from '../../types/mediaKit';
import { buildStageReach, stageGridColumns, type StagePlatform } from '../../utils/mediaKitStage';
import { MediaKitGrow } from './MediaKitGrow';
import { MediaKitRise } from './MediaKitRise';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
const GRID_MAX = moderateScale(312);
const SINGLE_TILE = moderateScale(170);
const BAR_MAX = moderateScale(300);
const BAR_HEIGHT = moderateScale(8);
const BAR_GAP = moderateScale(3);
/** A tiny audience still gets a visible sliver. */
const BAR_MIN = moderateScale(6);
const SEGMENT_STAGGER = 120;
const SEGMENT_DELAY = 300;
const TILE_LOGO = moderateScale(22);

const ShareSegment = memo<{ item: StagePlatform; index: number }>(({ item, index }) => {
  const { colors } = useTheme();
  const tones = colors.social[item.platform];
  const styles = useStyles(
    ({ radii }) => ({
      segment: { flex: Math.max(item.followers, 1), minWidth: BAR_MIN, borderRadius: radii.xs, overflow: 'hidden' as const },
    }),
    [item.followers],
  );
  const [first = colors.interactive.main] = tones;
  return (
    <MediaKitGrow axis="x" delay={SEGMENT_DELAY + index * SEGMENT_STAGGER} style={styles.segment}>
      {tones.length > 1 ? (
        <LinearGradient colors={tones} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      ) : (
        <Box flex={1} bg={first} />
      )}
    </MediaKitGrow>
  );
});

const PlatformTile = memo<{ item: StagePlatform; width: number }>(({ item, width }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const followers = formatNumber(item.followers, COMPACT);
  return (
    <Box
      row
      align="center"
      gap="xs"
      width={width}
      height={sizes.button.md}
      px="sm"
      borderRadius="md"
      bg={colors.stage.chip}
      borderWidth="thin"
      borderColor={colors.glass.border}
      accessible
      accessibilityLabel={t('account.mediaKit.showcase.platformA11y', { platform: item.label, followers })}
    >
      <SocialPlatformIcon platform={item.platform} size={TILE_LOGO} color={colors.text.onBrand} />
      <AnimatedNumber value={followers} variant="title" color={colors.text.onBrand} />
      {item.verified ? <BadgeCheck size={sizes.icon.xs} color={colors.premium.main} /> : null}
      <Box flex={1} />
      <Text variant="caption" color={colors.text.onBrandMuted}>
        {formatNumber(item.sharePct / 100, PERCENT)}
      </Text>
    </Box>
  );
});

/**
 * The reach moment: all followers as one giant rolling number, a bar split by each
 * platform's own colors, then a tile per platform (one centred, then pairs: four fit a 2 × 2
 * grid, more add rows) with its count, the verified seal and its share.
 */
const MediaKitStageReachComponent: React.FC<{ platforms: readonly MediaKitPlatform[] }> = ({ platforms }) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const reach = useMemo(() => buildStageReach(platforms), [platforms]);
  const count = reach.platforms.length;
  const columns = stageGridColumns(count);
  const gridWidth = columns === 1 ? SINGLE_TILE : Math.min(windowWidth - spacing.xl * 2, GRID_MAX);
  const tileWidth = columns === 1 ? SINGLE_TILE : (gridWidth - spacing.sm) / 2;
  const total = formatNumber(reach.total, COMPACT);
  const caption = t('account.mediaKit.showcase.stage.reach', { count });
  const styles = useStyles(
    () => ({ bar: { flexDirection: 'row' as const, gap: BAR_GAP, height: BAR_HEIGHT, width: '100%' as const, maxWidth: BAR_MAX } }),
    [],
  );

  if (count === 0) return null;

  return (
    <Box align="center" gap="md" width="100%">
      <MediaKitRise delay={SEGMENT_DELAY}>
        <Box align="center" accessible accessibilityLabel={`${total} ${caption}`}>
          <AnimatedNumber value={total} variant="amountDisplay" color={colors.text.onBrand} />
          <Text variant="bodySmall" color={colors.text.onBrandMuted}>
            {caption}
          </Text>
        </Box>
      </MediaKitRise>
      <Box style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {reach.platforms.map((item, index) => (
          <ShareSegment key={item.platform} item={item} index={index} />
        ))}
      </Box>
      <Box row wrap justify="center" gap="sm" width={gridWidth}>
        {reach.platforms.map(item => (
          <PlatformTile key={item.platform} item={item} width={tileWidth} />
        ))}
      </Box>
    </Box>
  );
};

export const MediaKitStageReach = memo(MediaKitStageReachComponent);
