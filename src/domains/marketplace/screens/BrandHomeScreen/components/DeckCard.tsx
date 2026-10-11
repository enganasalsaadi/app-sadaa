import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, type AccessibilityActionEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Lock, MapPin, Zap } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text, TierBadge } from '@/shared/ui';
import { ShortlistHeart } from '../../../components/ShortlistHeart';
import { PRICE_LOCK_FALLBACK, PRICE_LOCK_LABEL } from '../../../constants/priceLock';
import type { ExploreCreator } from '../../../types/explore';
import { followersOf, nicheCityOf } from '../../../utils/creatorText';
import { DECK_THROW_DISTANCE } from '../hooks/useStoryDeck';
import { CreatorMedia } from './CreatorMedia';
import { MediaChip } from './MediaChip';
import { STORY_BAR_HEIGHT, StoryBars } from './StoryBars';
import { VerifiedMark } from './VerifiedMark';

/** Cards visible behind the top one; the rest wait, invisible, at the back. */
const DEPTH = 2;
/** Each step back: lower, smaller, darker. */
export const DECK_STEP = moderateScale(18);
const SCALE_STEP = 0.07;
const DIM_STEP = 0.2;
const TILT_DIVISOR = 18;
const ACTION_NEXT = 'next';

interface DeckCardProps {
  creator: ExploreCreator;
  /** Position in the server order; depth is derived from `base`. */
  index: number;
  count: number;
  isTop: boolean;
  base: SharedValue<number>;
  drag: SharedValue<number>;
  onOpen: (creator: ExploreCreator) => void;
  onToggleShortlist: (creator: ExploreCreator) => void;
  onNext: () => void;
}

/** "From $120" in white over the photo, or the 🔒 chip when prices are hidden. */
const DeckPrice = memo<{ creator: ExploreCreator }>(({ creator }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { price } = creator;
  if (price.locked) {
    return (
      <MediaChip
        icon={Lock}
        label={t(price.lockReason ? PRICE_LOCK_LABEL[price.lockReason] : PRICE_LOCK_FALLBACK)}
      />
    );
  }
  if (!price.from) return null;
  return (
    <Box align="flex-end">
      <Text variant="caption" color={colors.text.onBrandMuted}>
        {t('marketplace.creator.priceFrom')}
      </Text>
      <MoneyText value={price.from} size="title" tone="onBrand" precision="currency" />
    </Box>
  );
});

/**
 * One full-bleed story card of the deck. Its depth comes from the shared `base` (cards thrown so
 * far), so stepping forward happens on the UI thread: while the top card is dragged, the ones
 * behind already rise toward its place.
 */
const DeckCardComponent: React.FC<DeckCardProps> = ({
  creator,
  index,
  count,
  isTop,
  base,
  drag,
  onOpen,
  onToggleShortlist,
  onNext,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const open = useCallback(() => onOpen(creator), [creator, onOpen]);
  const toggle = useCallback(() => onToggleShortlist(creator), [creator, onToggleShortlist]);
  const actions = useMemo(() => [{ name: ACTION_NEXT, label: t('marketplace.brandHome.deck.next') }], [t]);
  const onAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === ACTION_NEXT) onNext();
    },
    [onNext],
  );

  const styles = useStyles(({ colors: palette, spacing, radii, shadows }) => ({
    card: {
      position: 'absolute' as const,
      top: 0,
      start: 0,
      end: 0,
      bottom: DECK_STEP * DEPTH,
      borderRadius: radii.xl,
      overflow: 'hidden' as const,
      ...shadows.lg,
    },
    bars: { position: 'absolute' as const, top: spacing.md, start: spacing.lg, end: spacing.lg },
    top: {
      position: 'absolute' as const,
      top: spacing.md + STORY_BAR_HEIGHT + spacing.sm,
      start: spacing.lg,
      end: spacing.lg,
    },
    body: { position: 'absolute' as const, bottom: spacing.xl, start: spacing.xl, end: spacing.xl },
    shrink: { flexShrink: 1 },
    dim: { position: 'absolute' as const, top: 0, bottom: 0, start: 0, end: 0, backgroundColor: palette.media.dim },
  }), []);

  const cardStyle = useAnimatedStyle(() => {
    const rel = (((index - base.value) % count) + count) % count;
    const lead = rel === 0;
    // While the top card moves, everything behind rises by the same fraction.
    const pull = Math.min(Math.abs(drag.value) / DECK_THROW_DISTANCE, 1);
    const depth = lead ? 0 : rel - pull;
    const shown = Math.min(depth, DEPTH);
    return {
      zIndex: count - rel,
      opacity: interpolate(depth, [DEPTH, DEPTH + 1], [1, 0], 'clamp'),
      transform: [
        { translateX: lead ? drag.value : 0 },
        { translateY: shown * DECK_STEP },
        { rotate: `${lead ? drag.value / TILT_DIVISOR : 0}deg` },
        { scale: 1 - shown * SCALE_STEP },
      ],
    };
  });
  const dimStyle = useAnimatedStyle(() => {
    const rel = (((index - base.value) % count) + count) % count;
    const pull = Math.min(Math.abs(drag.value) / DECK_THROW_DISTANCE, 1);
    const depth = rel === 0 ? 0 : Math.min(rel - pull, DEPTH);
    return { opacity: depth * DIM_STEP };
  });

  const meta = nicheCityOf(creator);
  const followers = followersOf(creator);
  const days = creator.fastestDeliveryDays;

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      pointerEvents={isTop ? 'auto' : 'none'}
      accessibilityElementsHidden={!isTop}
      importantForAccessibility={isTop ? 'auto' : 'no-hide-descendants'}
    >
      <CreatorMedia creator={creator} scrim topShade />
      <Animated.View
        style={[styles.dim, dimStyle]}
        pointerEvents="none"
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={
          meta
            ? t('marketplace.brandHome.deck.cardLabel', { name: creator.displayName, meta })
            : creator.displayName
        }
        accessibilityHint={t('marketplace.brandHome.deck.hint')}
        accessibilityActions={actions}
        onAccessibilityAction={onAction}
      />
      {count > 1 ? (
        <Box style={styles.bars}>
          <StoryBars count={count} current={index} />
        </Box>
      ) : null}
      <Box style={styles.top} row align="center" gap="sm" pointerEvents="box-none">
        {creator.tier ? (
          <TierBadge tier={creator.tier} size="sm" surface="media" interactive={false} />
        ) : null}
        {creator.badges.kycVerified ? <VerifiedMark /> : null}
        <Box flex={1} />
        <ShortlistHeart selected={creator.isShortlisted} onToggle={toggle} onMedia />
      </Box>
      <Box style={styles.body} gap="xs" pointerEvents="none">
        <Text variant="h1" color={colors.text.onBrand} numberOfLines={1}>
          {creator.displayName}
        </Text>
        {meta ? (
          <Box row align="center" gap="xs">
            <MapPin size={sizes.icon.xs} color={colors.text.onBrandMuted} />
            <Box style={styles.shrink}>
              <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
                {meta}
              </Text>
            </Box>
          </Box>
        ) : null}
        <Box row align="flex-end" gap="sm" mt="md">
          <Box row wrap gap="sm" flex={1}>
            {followers && creator.primaryPlatform ? (
              <MediaChip strong={followers} label={creator.primaryPlatform.platformLabel} />
            ) : null}
            {days !== null ? (
              <MediaChip icon={Zap} label={t('marketplace.brandHome.deliveryWithin', { count: days })} />
            ) : null}
          </Box>
          <DeckPrice creator={creator} />
        </Box>
      </Box>
    </Animated.View>
  );
};

export const DeckCard = memo(DeckCardComponent);
