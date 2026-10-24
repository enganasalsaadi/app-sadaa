import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, CircleCheck, Handshake, Lock, MapPin, Zap } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  Image,
  MoneyText,
  Pressable,
  SocialPlatformIcon,
  StatusPill,
  Text,
  TierBadge,
} from '@/shared/ui';
import { PRICE_LOCK_FALLBACK, PRICE_LOCK_LABEL } from '../constants/priceLock';
import type { ExploreCreator } from '../types/explore';
import { monogramOf } from '../utils/creatorText';
import { CreatorReputation } from './CreatorReputation';
import { ShortlistHeart } from './ShortlistHeart';

/** Photos are 4:5 portraits. */
const PHOTO_RATIO = 5 / 4;
const ROW_PHOTO_WIDTH = moderateScale(88);
const ROW_PHOTO_HEIGHT = Math.round(ROW_PHOTO_WIDTH * PHOTO_RATIO);
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const MAX_ROW_NICHES = 2;

export interface CreatorCardProps {
  creator: ExploreCreator;
  /** Picked for comparison (up to 3). */
  selected?: boolean;
  /** Receives the creator — pass one stable handler to every card so `memo` holds. */
  onPress: (creator: ExploreCreator) => void;
  /** ❤️ toggle; omit where there is no shortlist. */
  onToggleShortlist?: (creator: ExploreCreator) => void;
  /** Starts a direct offer (brand only; the builder runs the preflight). Omit to hide the button. */
  onRequestOffer?: (creator: ExploreCreator) => void;
}

type Part = { creator: ExploreCreator };

/**
 * The creator's photo, 4:5 and cropped to fill; no photo (or a broken one) → the monogram on
 * `brand.soft`, so the card stays handsome either way.
 */
const CreatorPhoto = memo<Part>(({ creator }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const width = ROW_PHOTO_WIDTH;
  const height = ROW_PHOTO_HEIGHT;
  const showImage = !!creator.avatarUrl && !failed;

  return (
    <Box
      width={width}
      height={height}
      align="center"
      justify="center"
      overflow="hidden"
      bg={colors.brand.soft}
      borderRadius="md"
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
        <Text variant="h3" color={colors.brand.text}>
          {monogramOf(creator.displayName)}
        </Text>
      )}
    </Box>
  );
});

const CreatorName = memo<Part>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  return (
    <Box row align="center" gap="xs">
      <Box style={styles.shrink}>
        <Text variant="title" numberOfLines={1}>
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
        <SocialPlatformIcon platform={platform.platform} size={sizes.icon.xs} color={colors.text.primary} />
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

/** One line, "From $40 ≈ SYP"; viewers who can't see prices yet get the 🔒 line instead. */
const PriceLine = memo<Part>(({ creator }) => {
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

const RowBody = memo<Part>(({ creator }) => {
  const { colors } = useTheme();
  const meta = metaOf(creator, MAX_ROW_NICHES);
  return (
    <Box row gap="md">
      <CreatorPhoto creator={creator} />
      {/* Clears the ❤️ at the reading end. */}
      <Box flex={1} gap="xs" pe="3xl">
        <CreatorName creator={creator} />
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
        <CreatorReputation creator={creator} />
        <PriceLine creator={creator} />
      </Box>
    </Box>
  );
});

/** Teal disc at the card's bottom-end corner (approved 2026-10-16): straight to the offer builder. */
const RequestOfferButton = memo<{ name: string; onPress: () => void }>(({ name, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      align="center"
      justify="center"
      hitSlop={sizes.hitSlop.sm}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.offer.cardCta', { name })}
    >
      <Box
        width={sizes.button.sm}
        height={sizes.button.sm}
        borderRadius="full"
        align="center"
        justify="center"
        bg={colors.interactive.soft}
      >
        <Handshake size={sizes.icon.sm} color={colors.interactive.main} />
      </Box>
    </Pressable>
  );
});

/**
 * Creator result (handoff `CreatorCard`) for Explore and Shortlist: photo beside the details,
 * with the reputation seal (★ · ✓ · ⏱) when the server has a track record.
 * The ❤️ (top-end) and the offer disc (bottom-end) sit beside the card, not inside it, so screen
 * readers reach every button.
 * List item — keep it memoised and pass stable handlers.
 */
const CreatorCardComponent: React.FC<CreatorCardProps> = ({
  creator,
  selected,
  onPress,
  onToggleShortlist,
  onRequestOffer,
}) => {
  const styles = useStyles(({ spacing }) => ({
    heart: { position: 'absolute' as const, top: spacing.xs, end: spacing.xs },
    offer: { position: 'absolute' as const, bottom: spacing.xs, end: spacing.xs },
  }), []);
  const press = useCallback(() => onPress(creator), [creator, onPress]);
  const toggle = useCallback(() => onToggleShortlist?.(creator), [creator, onToggleShortlist]);
  const requestOffer = useCallback(() => onRequestOffer?.(creator), [creator, onRequestOffer]);

  return (
    <Box>
      <Card onPress={press} selected={selected} accessibilityLabel={creator.displayName}>
        <RowBody creator={creator} />
      </Card>
      {onToggleShortlist ? (
        <Box style={styles.heart}>
          <ShortlistHeart selected={creator.isShortlisted} onToggle={toggle} />
        </Box>
      ) : null}
      {onRequestOffer ? (
        <Box style={styles.offer}>
          <RequestOfferButton name={creator.displayName} onPress={requestOffer} />
        </Box>
      ) : null}
    </Box>
  );
};

export const CreatorCard = memo(CreatorCardComponent);
