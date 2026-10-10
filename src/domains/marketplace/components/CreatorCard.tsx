import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, CircleCheck, Lock, MapPin, Zap } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  Image,
  MoneyText,
  SocialPlatformIcon,
  StatusPill,
  Text,
  TierBadge,
} from '@/shared/ui';
import { PRICE_LOCK_FALLBACK, PRICE_LOCK_LABEL } from '../constants/priceLock';
import type { ExploreCreator } from '../types/explore';
import { ShortlistHeart } from './ShortlistHeart';

/** Home rail tile: two and a bit fit a phone, so the rail reads as swipeable. */
export const CREATOR_RAIL_CARD_WIDTH = moderateScale(168);
/** Photos are 4:5 portraits (rule 08 creator media). */
const PHOTO_RATIO = 5 / 4;
export const CREATOR_RAIL_PHOTO_HEIGHT = Math.round(CREATOR_RAIL_CARD_WIDTH * PHOTO_RATIO);
const ROW_PHOTO_WIDTH = moderateScale(88);
const ROW_PHOTO_HEIGHT = Math.round(ROW_PHOTO_WIDTH * PHOTO_RATIO);
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const MAX_ROW_NICHES = 2;

export type CreatorCardVariant = 'rail' | 'row';

export interface CreatorCardProps {
  creator: ExploreCreator;
  /** `rail` = compact Home tile · `row` = Explore / Shortlist list row. Default `row`. */
  variant?: CreatorCardVariant;
  /** Picked for comparison (up to 3). */
  selected?: boolean;
  /** Receives the creator — pass one stable handler to every card so `memo` holds. */
  onPress: (creator: ExploreCreator) => void;
  /** ❤️ toggle; omit where there is no shortlist. */
  onToggleShortlist?: (creator: ExploreCreator) => void;
}

type Part = { creator: ExploreCreator };

/** First letter of the name, for the photo-less monogram. */
const monogramOf = (name: string): string => Array.from(name.trim())[0] ?? '';

/**
 * The creator's photo, 4:5 and cropped to fill; no photo (or a broken one) → the monogram on
 * `brand.soft`, so the card stays handsome either way.
 */
const CreatorPhoto = memo<Part & { variant: CreatorCardVariant }>(({ creator, variant }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const rail = variant === 'rail';
  // The rail photo fills the card inside its hairline border.
  const width = rail ? '100%' : ROW_PHOTO_WIDTH;
  const height = rail ? CREATOR_RAIL_PHOTO_HEIGHT : ROW_PHOTO_HEIGHT;
  const showImage = !!creator.avatarUrl && !failed;

  return (
    <Box
      width={width}
      height={height}
      align="center"
      justify="center"
      overflow="hidden"
      bg={colors.brand.soft}
      borderRadius={rail ? undefined : 'md'}
      borderTopStartRadius={rail ? 'lg' : undefined}
      borderTopEndRadius={rail ? 'lg' : undefined}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showImage ? (
        <Image
          uri={creator.avatarUrl ?? undefined}
          width={width}
          height={height}
          resizeMode="cover"
          onError={onError}
        />
      ) : (
        <Text variant={rail ? 'h1' : 'h3'} color={colors.brand.text}>
          {monogramOf(creator.displayName)}
        </Text>
      )}
    </Box>
  );
});

const CreatorName = memo<Part & { variant: CreatorCardVariant }>(({ creator, variant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  return (
    <Box row align="center" gap="xs">
      <Box style={styles.shrink}>
        <Text variant={variant === 'rail' ? 'bodyMedium' : 'title'} numberOfLines={1}>
          {creator.displayName}
        </Text>
      </Box>
      {creator.badges.kycVerified ? (
        <BadgeCheck
          size={sizes.icon.sm}
          color={colors.premium.main}
          accessibilityLabel={t('marketplace.creator.verified')}
        />
      ) : null}
    </Box>
  );
});

/** Platform mark, compact follower count and ✓ when the count is verified. */
const FollowerStat = memo<Part>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const platform = creator.primaryPlatform;
  if (!platform) return null;
  return (
    <Box row align="center" gap="xs">
      {isSocialPlatform(platform.platform) ? (
        <SocialPlatformIcon platform={platform.platform} size={sizes.icon.xs} color={colors.icon.secondary} />
      ) : null}
      <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
        {formatNumber(platform.followerCount, COMPACT)}
      </Text>
      {platform.followerCountVerified ? (
        <CircleCheck
          size={sizes.icon.xs}
          color={colors.interactive.main}
          accessibilityLabel={t('marketplace.creator.followersVerified')}
        />
      ) : null}
    </Box>
  );
});

/** Tier, platform and followers on a dark pill over the photo's bottom corner. */
const MediaStats = memo<Part>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const platform = creator.primaryPlatform;
  if (!platform && !creator.tier) return null;
  return (
    <Box row align="center" gap="xs" px="sm" py="xs" borderRadius="sm" bg={colors.overlay}>
      {creator.tier ? <TierBadge tier={creator.tier} size="xs" interactive={false} /> : null}
      {platform && isSocialPlatform(platform.platform) ? (
        <SocialPlatformIcon platform={platform.platform} size={sizes.icon.xs} color={colors.text.onBrand} />
      ) : null}
      {platform ? (
        <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
          {formatNumber(platform.followerCount, COMPACT)}
        </Text>
      ) : null}
      {platform?.followerCountVerified ? (
        <CircleCheck
          size={sizes.icon.xs}
          color={colors.glass.iconInteractive}
          accessibilityLabel={t('marketplace.creator.followersVerified')}
        />
      ) : null}
    </Box>
  );
});

/**
 * Rail: "From" over a bold price with ≈ SYP muted under it. Row: one line, "From $40 ≈ SYP".
 * Viewers who can't see prices yet get the 🔒 line instead.
 */
const PriceLine = memo<Part & { variant: CreatorCardVariant }>(({ creator, variant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { price } = creator;

  if (price.locked) {
    return (
      <Box row align="center" gap="xs">
        <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t(price.lockReason ? PRICE_LOCK_LABEL[price.lockReason] : PRICE_LOCK_FALLBACK)}
          </Text>
        </Box>
      </Box>
    );
  }
  if (!price.from) return null;
  if (variant === 'rail') {
    return (
      <Box>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.creator.priceFrom')}
        </Text>
        <MoneyText value={price.from} size="title" precision="currency" />
        {price.fromSypApprox ? (
          <MoneyText value={price.fromSypApprox} size="sm" tone="muted" estimate />
        ) : null}
      </Box>
    );
  }
  return (
    <Box row align="center" gap="xs" wrap>
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.creator.priceFrom')}
      </Text>
      <MoneyText value={price.from} size="md" />
      {price.fromSypApprox ? (
        <MoneyText value={price.fromSypApprox} size="sm" tone="muted" estimate />
      ) : null}
    </Box>
  );
});

/** ⚡ fastest delivery, 📍 on site and «new» for list rows. */
const RowSignals = memo<Part>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { badges, fastestDeliveryDays } = creator;
  return (
    <Box row align="center" gap="md" wrap>
      <FollowerStat creator={creator} />
      {fastestDeliveryDays !== null ? (
        <Box row align="center" gap="xs">
          <Zap size={sizes.icon.xs} color={badges.rush ? colors.interactive.main : colors.icon.secondary} />
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.creator.deliveryDays', { count: fastestDeliveryDays })}
          </Text>
        </Box>
      ) : null}
      {badges.onSite ? (
        <Box row align="center" gap="xs">
          <MapPin size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.creator.onSite')}
          </Text>
        </Box>
      ) : null}
      {badges.isNew ? <StatusPill label={t('marketplace.creator.new')} tone="interactive" size="sm" /> : null}
    </Box>
  );
});

/** City · first niche, one muted line. */
const metaOf = (creator: ExploreCreator, niches: number): string =>
  [creator.governorate?.label, ...creator.niches.slice(0, niches).map(n => n.label)]
    .filter(Boolean)
    .join(' · ');

const RailBody = memo<Part>(({ creator }) => {
  const { colors } = useTheme();
  const meta = metaOf(creator, 1);
  return (
    <Box flex={1} justify="space-between" gap="sm" p="md">
      <Box gap="xs">
        <CreatorName creator={creator} variant="rail" />
        {meta ? (
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </Box>
      <PriceLine creator={creator} variant="rail" />
    </Box>
  );
});

const RowBody = memo<Part>(({ creator }) => {
  const { colors } = useTheme();
  const meta = metaOf(creator, MAX_ROW_NICHES);
  return (
    <Box row gap="md">
      <CreatorPhoto creator={creator} variant="row" />
      {/* Clears the ❤️ at the reading end. */}
      <Box flex={1} gap="xs" pe="3xl">
        <CreatorName creator={creator} variant="row" />
        <Box row align="center" gap="sm">
          {creator.tier ? <TierBadge tier={creator.tier} size="sm" interactive={false} /> : null}
          {meta ? (
            <Box flex={1}>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {meta}
              </Text>
            </Box>
          ) : null}
        </Box>
        <RowSignals creator={creator} />
        <PriceLine creator={creator} variant="row" />
      </Box>
    </Box>
  );
});

/**
 * Creator result (handoff `CreatorCard`): Home rails (`rail`, photo-first 4:5 tile with the
 * stats on the photo), Explore and Shortlist (`row`, photo beside the details). The ❤️ sits
 * beside the card, not inside it, so screen readers reach both buttons.
 * List item — keep it memoised and pass stable handlers.
 */
const CreatorCardComponent: React.FC<CreatorCardProps> = ({
  creator,
  variant = 'row',
  selected,
  onPress,
  onToggleShortlist,
}) => {
  const { t } = useTranslation();
  const styles = useStyles(({ spacing }) => ({
    heart: { position: 'absolute' as const, top: spacing.xs, end: spacing.xs },
    corner: { position: 'absolute' as const, top: spacing.md, start: spacing.md },
    // The rail photo runs edge to edge; its body pads itself.
    flush: { padding: 0 },
    stats: {
      position: 'absolute' as const,
      top: CREATOR_RAIL_PHOTO_HEIGHT - spacing.sm,
      start: spacing.sm,
      transform: [{ translateY: '-100%' as const }],
    },
  }));
  const press = useCallback(() => onPress(creator), [creator, onPress]);
  const toggle = useCallback(() => onToggleShortlist?.(creator), [creator, onToggleShortlist]);
  const rail = variant === 'rail';

  return (
    <Box width={rail ? CREATOR_RAIL_CARD_WIDTH : undefined}>
      <Card
        flex={rail ? 1 : undefined}
        style={rail ? styles.flush : undefined}
        onPress={press}
        selected={selected}
        accessibilityLabel={creator.displayName}
      >
        {rail ? <CreatorPhoto creator={creator} variant="rail" /> : null}
        {rail ? <RailBody creator={creator} /> : <RowBody creator={creator} />}
      </Card>
      {rail ? (
        <Box style={styles.stats} pointerEvents="none">
          <MediaStats creator={creator} />
        </Box>
      ) : null}
      {rail && creator.badges.isNew ? (
        <Box style={styles.corner} pointerEvents="none">
          <StatusPill label={t('marketplace.creator.new')} tone="interactive" size="sm" />
        </Box>
      ) : null}
      {onToggleShortlist ? (
        <Box style={styles.heart}>
          <ShortlistHeart selected={creator.isShortlisted} onToggle={toggle} onMedia={rail} />
        </Box>
      ) : null}
    </Box>
  );
};

export const CreatorCard = memo(CreatorCardComponent);
