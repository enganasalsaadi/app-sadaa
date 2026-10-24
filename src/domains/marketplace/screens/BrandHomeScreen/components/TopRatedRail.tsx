import React, { memo, useCallback, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Rail, Text } from '@/shared/ui';
import type { ExploreCreator, PublicRating } from '../../../types';
import { CreatorMedia } from './CreatorMedia';

const CARD_WIDTH = moderateScale(156);
const CARD_HEIGHT = moderateScale(236);
const RATING_MAX = 5;

/** Gold bar under the score, filling once to `average / 5` (static under reduced motion). */
const Meter = memo<{ average: number }>(({ average }) => {
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const target = Math.min(1, Math.max(0, average / RATING_MAX));
  const fill = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    fill.value = reduceMotion
      ? target
      : withTiming(target, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [fill, reduceMotion, target]);

  const styles = useStyles(
    (): Record<'fill', ViewStyle> => ({
      // transformOrigin is physical, so grow from the reading start.
      fill: { backgroundColor: colors.premium.main, transformOrigin: isRTL ? 'right' : 'left' },
    }),
    [colors.premium.main, isRTL],
  );
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.value }] }));

  return (
    <Box height={sizes.progress.track} borderRadius="full" overflow="hidden" bg={colors.media.bar}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.fill, fillStyle]} />
    </Box>
  );
});

/** Frosted corner chip over the photo: gold ★ and how many ratings back the score. */
const CountChip = memo<{ count: number }>(({ count }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="full"
      bg={colors.media.glass}
      borderWidth="thin"
      borderColor={colors.media.glassBorder}
    >
      <Star size={sizes.icon.xs} color={colors.premium.main} fill={colors.premium.main} />
      <Text variant="caption" color={colors.text.onBrand}>
        {t('common.rating.countShort', { count: formatNumber(count) })}
      </Text>
    </Box>
  );
});

const Score = memo<{ rating: PublicRating }>(({ rating }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Box row align="flex-end" gap="xs">
        <Text variant="amountHero" color={colors.text.onBrand}>
          {formatNumber(rating.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </Text>
        <Box pb="sm">
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.brandHome.topRated.outOf', { max: formatNumber(RATING_MAX) })}
          </Text>
        </Box>
      </Box>
      <Meter average={rating.average} />
    </Box>
  );
});

const Card = memo<{ creator: ExploreCreator; onOpen: (creator: ExploreCreator) => void }>(
  ({ creator, onOpen }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const open = useCallback(() => onOpen(creator), [creator, onOpen]);
    const styles = useStyles(
      ({ spacing }): Record<'chip' | 'body', ViewStyle> => ({
        chip: { position: 'absolute', top: spacing.md, end: spacing.md },
        body: { position: 'absolute', bottom: spacing.md, start: spacing.md, end: spacing.md },
      }),
      [],
    );
    const { rating } = creator;
    const label = rating
      ? `${creator.displayName}, ${t('common.rating.summary', {
          value: formatNumber(rating.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          max: formatNumber(RATING_MAX),
        })}, ${t('common.rating.count', { count: formatNumber(rating.count) })}`
      : creator.displayName;

    return (
      <Pressable
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        borderRadius="xl"
        overflow="hidden"
        shadow="card"
        onPress={open}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <CreatorMedia creator={creator} scrim />
        {rating ? (
          <Box style={styles.chip}>
            <CountChip count={rating.count} />
          </Box>
        ) : null}
        <Box style={styles.body} gap="md">
          {rating ? <Score rating={rating} /> : null}
          <Box row align="center" justify="space-between" gap="sm">
            <Box flex={1}>
              <Text variant="buttonSmall" color={colors.text.onBrand} numberOfLines={1}>
                {creator.displayName}
              </Text>
            </Box>
            {creator.governorate ? (
              <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
                {creator.governorate.label}
              </Text>
            ) : null}
          </Box>
        </Box>
      </Pressable>
    );
  },
);

interface TopRatedRailProps {
  creators: ExploreCreator[];
  onOpen: (creator: ExploreCreator) => void;
}

/**
 * «Top rated» rail (approved 2026-10-24): tall photo cards with the score carved large on the
 * photo and a gold meter filling once to it; the count rides a frosted chip in the corner.
 */
const TopRatedRailComponent: React.FC<TopRatedRailProps> = ({ creators, onOpen }) => {
  const { spacing } = useTheme();
  return (
    <Rail shadow="card" snapInterval={CARD_WIDTH + spacing.md}>
      {creators.map(creator => (
        <Card key={creator.slug} creator={creator} onOpen={onOpen} />
      ))}
    </Rail>
  );
};

export const TopRatedRail = memo(TopRatedRailComponent);
