import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text, TierBadge } from '@/shared/ui';
import { PRICE_LOCK_FALLBACK, PRICE_LOCK_LABEL } from '../../../constants/priceLock';
import type { ExploreCreator } from '../../../types/explore';
import { followersOf, nicheCityOf } from '../../../utils/creatorText';
import { CreatorMedia } from './CreatorMedia';
import { VerifiedMark } from './VerifiedMark';

const TILE_WIDTH = moderateScale(184);
const TILE_HEIGHT = moderateScale(268);

interface VerifiedTilesProps {
  creators: ExploreCreator[];
  onOpen: (creator: ExploreCreator) => void;
}

/** One stat over the photo: bold figure on top, muted caption under it. */
const Stat = memo<{ children: React.ReactNode; caption: string }>(({ children, caption }) => {
  const { colors } = useTheme();
  return (
    <Box flex={1}>
      {children}
      <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
        {caption}
      </Text>
    </Box>
  );
});

const TilePrice = memo<{ creator: ExploreCreator }>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { price } = creator;
  if (price.locked) {
    return (
      <Box flex={1} row align="center" gap="xs">
        <Lock size={sizes.icon.xs} color={colors.text.onBrandMuted} />
        <Box flex={1}>
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={2}>
            {t(price.lockReason ? PRICE_LOCK_LABEL[price.lockReason] : PRICE_LOCK_FALLBACK)}
          </Text>
        </Box>
      </Box>
    );
  }
  if (!price.from) return null;
  return (
    <Stat caption={t('marketplace.creator.priceFrom')}>
      <MoneyText value={price.from} size="md" tone="onBrand" precision="currency" />
    </Stat>
  );
});

const Tile = memo<{ creator: ExploreCreator; onOpen: (creator: ExploreCreator) => void }>(
  ({ creator, onOpen }) => {
    const { colors } = useTheme();
    const open = useCallback(() => onOpen(creator), [creator, onOpen]);
    const styles = useStyles(({ spacing }) => ({
      top: { position: 'absolute' as const, top: spacing.md, start: spacing.md, end: spacing.md },
      body: { position: 'absolute' as const, bottom: spacing.md, start: spacing.md, end: spacing.md },
    }), []);
    const meta = nicheCityOf(creator);
    const followers = followersOf(creator);

    return (
      <Pressable
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        borderRadius="xl"
        overflow="hidden"
        shadow="card"
        onPress={open}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={creator.displayName}
      >
        <CreatorMedia creator={creator} scrim />
        <Box style={styles.top} row align="center" gap="xs">
          {creator.badges.kycVerified ? <VerifiedMark /> : null}
          {creator.tier ? (
            <TierBadge tier={creator.tier} size="sm" surface="media" interactive={false} />
          ) : null}
        </Box>
        <Box style={styles.body} gap="xs">
          <Box>
            <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
              {creator.displayName}
            </Text>
            {meta ? (
              <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </Box>
          <Box row gap="md" pt="sm" borderTopWidth="thin" borderColor={colors.media.divider}>
            {followers && creator.primaryPlatform ? (
              <Stat caption={creator.primaryPlatform.platformLabel}>
                <Text variant="buttonSmall" color={colors.text.onBrand} numberOfLines={1}>
                  {followers}
                </Text>
              </Stat>
            ) : null}
            <TilePrice creator={creator} />
          </Box>
        </Box>
      </Pressable>
    );
  },
);

/**
 * Verified rail: tall photo tiles, each a small pitch — tier and ✓ on top, then name,
 * niche · city, and a two-figure strip (followers on their platform, starting price).
 */
const VerifiedTilesComponent: React.FC<VerifiedTilesProps> = ({ creators, onOpen }) => {
  const { spacing, shadows } = useTheme();
  const styles = useStyles(() => ({
    // The scroll view clips: the bottom pad keeps the tiles' shadow whole.
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xs,
      paddingBottom: (shadows.card.shadowOffset?.height ?? 0) + (shadows.card.shadowRadius ?? 0),
      gap: spacing.md,
    },
  }), [spacing, shadows]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      snapToInterval={TILE_WIDTH + spacing.md}
      decelerationRate="fast"
    >
      {creators.map(creator => (
        <Tile key={creator.slug} creator={creator} onOpen={onOpen} />
      ))}
    </ScrollView>
  );
};

export const VerifiedTiles = memo(VerifiedTilesComponent);
