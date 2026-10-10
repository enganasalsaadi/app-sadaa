import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, CircleCheck, Lock, MapPin, Zap } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Avatar,
  Box,
  Card,
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
export const CREATOR_RAIL_CARD_WIDTH = moderateScale(156);
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

const CreatorName = memo<Part & { variant: CreatorCardVariant }>(({ creator, variant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  return (
    <Box row align="center" gap="xs" justify={variant === 'rail' ? 'center' : 'flex-start'}>
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

/** "From $40 (≈ 600,000 SYP)", or the 🔒 line for viewers who can't see prices yet. */
const PriceLine = memo<Part & { variant: CreatorCardVariant }>(({ creator, variant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { price } = creator;
  const centered = variant === 'rail' ? 'center' : 'flex-start';

  if (price.locked) {
    return (
      <Box row align="center" gap="xs" justify={centered}>
        <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {t(price.lockReason ? PRICE_LOCK_LABEL[price.lockReason] : PRICE_LOCK_FALLBACK)}
        </Text>
      </Box>
    );
  }
  if (!price.from) return null;
  return (
    <Box row align="center" gap="xs" justify={centered} wrap>
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.creator.priceFrom')}
      </Text>
      <MoneyText value={price.from} size="sm" />
      {variant === 'row' && price.fromSypApprox ? (
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

const RailBody = memo<Part>(({ creator }) => {
  const { sizes } = useTheme();
  return (
    <Box align="center" gap="sm">
      <Avatar uri={creator.avatarUrl ?? undefined} size={sizes.avatar.lg} />
      <Box alignSelf="stretch" gap="xs">
        <CreatorName creator={creator} variant="rail" />
        <Box row align="center" justify="center" gap="xs">
          {creator.tier ? <TierBadge tier={creator.tier} size="xs" interactive={false} /> : null}
          <FollowerStat creator={creator} />
        </Box>
      </Box>
      <PriceLine creator={creator} variant="rail" />
    </Box>
  );
});

const RowBody = memo<Part>(({ creator }) => {
  const { colors, sizes } = useTheme();
  const meta = [creator.governorate?.label, ...creator.niches.slice(0, MAX_ROW_NICHES).map(n => n.label)]
    .filter(Boolean)
    .join(' · ');
  return (
    <Box gap="sm">
      {/* Clears the ❤️ at the reading end. */}
      <Box row align="center" gap="md" pe="3xl">
        <Avatar uri={creator.avatarUrl ?? undefined} size={sizes.avatar.md} />
        <Box flex={1} gap="xs">
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
        </Box>
      </Box>
      <RowSignals creator={creator} />
      <PriceLine creator={creator} variant="row" />
    </Box>
  );
});

/**
 * Creator result (handoff `CreatorCard`): Home rails (`rail`), Explore and Shortlist (`row`).
 * The ❤️ sits beside the card, not inside it, so screen readers reach both buttons.
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
  }));
  const press = useCallback(() => onPress(creator), [creator, onPress]);
  const toggle = useCallback(() => onToggleShortlist?.(creator), [creator, onToggleShortlist]);
  const rail = variant === 'rail';

  return (
    <Box width={rail ? CREATOR_RAIL_CARD_WIDTH : undefined}>
      <Card
        flex={rail ? 1 : undefined}
        p={rail ? 'md' : 'lg'}
        pt={rail ? 'lg' : undefined}
        onPress={press}
        selected={selected}
        accessibilityLabel={creator.displayName}
      >
        {rail ? <RailBody creator={creator} /> : <RowBody creator={creator} />}
      </Card>
      {rail && creator.badges.isNew ? (
        <Box style={styles.corner} pointerEvents="none">
          <StatusPill label={t('marketplace.creator.new')} tone="interactive" size="sm" />
        </Box>
      ) : null}
      {onToggleShortlist ? (
        <Box style={styles.heart}>
          <ShortlistHeart selected={creator.isShortlisted} onToggle={toggle} />
        </Box>
      ) : null}
    </Box>
  );
};

export const CreatorCard = memo(CreatorCardComponent);
