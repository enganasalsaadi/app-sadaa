import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { AtSign, Check, Plus } from 'lucide-react-native';
import type { FollowerTierId } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import type { PlatformResource } from '@/domains/auth';
import { isSocialPlatform } from '@/shared/utils';
import { Box, GradientSurface, Pressable, Rail, SectionHeader, Skeleton, SocialPlatformIcon, StatusPill, Text } from '@/shared/ui';
import { PLATFORM_STATUS_PILL } from '../../../constants/platformStatus';

const CARD_WIDTH = moderateScale(216);
const CARD_HEIGHT = moderateScale(232);
const ADD_WIDTH = moderateScale(140);
const ADD_ICON = moderateScale(52);
const WATERMARK = moderateScale(180);
const WATERMARK_OFFSET = moderateScale(-44);
const SKELETON_CARDS = [0, 1];

const TIER_NAME_KEY = {
  NANO: 'followerTier.NANO',
  MICRO: 'followerTier.MICRO',
  MID_TIER: 'followerTier.MID_TIER',
  MACRO: 'followerTier.MACRO',
  MEGA: 'followerTier.MEGA',
} as const satisfies Record<FollowerTierId, ParseKeys>;

interface PlatformCardProps {
  platform: PlatformResource;
  onPress: () => void;
}

/** One linked account: big follower count, its tier, the handle; the primary one sits on navy. */
const PlatformCard = memo<PlatformCardProps>(({ platform, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const primary = platform.is_primary;
  const ink = primary ? colors.text.onBrand : colors.text.primary;
  const muted = primary ? colors.text.onBrandMuted : colors.text.secondary;
  const review = PLATFORM_STATUS_PILL[platform.verification_status];

  const styles = useStyles(
    (): Record<'card' | 'watermark', ViewStyle> => ({
      card: { width: CARD_WIDTH, height: CARD_HEIGHT },
      watermark: { position: 'absolute', start: WATERMARK_OFFSET, bottom: WATERMARK_OFFSET, opacity: colors.profile.watermarkOpacity },
    }),
    [colors.profile.watermarkOpacity],
  );

  const followers =
    platform.follower_count == null ? '—' : formatNumber(platform.follower_count, { notation: 'compact' });
  const tier = platform.follower_tier ? t(TIER_NAME_KEY[platform.follower_tier]) : null;
  const followersLine = tier
    ? t('account.profile.platforms.followersTier', { tier })
    : t('account.profile.platforms.followers');

  const pill = review ? (
    <StatusPill label={t(review.labelKey)} tone={review.tone} icon={review.icon} size="sm" />
  ) : primary ? (
    <Box px="sm" py="xs" borderRadius="full" bg={colors.glass.badge} borderWidth="thin" borderColor={colors.glass.border}>
      <Text variant="caption" color={colors.text.onBrand}>
        {t('account.profile.platforms.primaryShort')}
      </Text>
    </Box>
  ) : (
    <StatusPill label={t('account.profile.platforms.verified')} tone="success" icon={Check} size="sm" />
  );

  const mark = isSocialPlatform(platform.platform) ? platform.platform : null;
  const content = (
    <>
      <Box style={styles.watermark} pointerEvents="none">
        {mark ? (
          <SocialPlatformIcon platform={mark} size={WATERMARK} color={ink} />
        ) : (
          <AtSign size={WATERMARK} color={ink} />
        )}
      </Box>
      <Box row align="center" gap="sm">
        {mark ? (
          <SocialPlatformIcon platform={mark} size={sizes.icon.sm} color={ink} />
        ) : (
          <AtSign size={sizes.icon.sm} color={ink} />
        )}
        <Box flex={1}>
          <Text variant="bodyMedium" color={ink} numberOfLines={1}>
            {platform.platform_label}
          </Text>
        </Box>
        {pill}
      </Box>
      <Box flex={1} justify="flex-end">
        <Text variant="h1" color={ink} numberOfLines={1}>
          {followers}
        </Text>
        <Text variant="bodySmall" color={muted} numberOfLines={1}>
          {followersLine}
        </Text>
      </Box>
      <Box mt="md">
        <Text variant="buttonSmall" color={ink} numberOfLines={1}>
          {`@${platform.username}`}
        </Text>
      </Box>
    </>
  );

  const a11y = `${platform.platform_label}, ${followers} ${followersLine}`;

  return primary ? (
    <Pressable onPress={onPress} scaleOnPress accessibilityRole="button" accessibilityLabel={a11y}>
      <GradientSurface variant="brand" style={styles.card} borderRadius="xl" p="lg">
        {content}
      </GradientSurface>
    </Pressable>
  ) : (
    <Pressable
      style={styles.card}
      onPress={onPress}
      scaleOnPress
      overflow="hidden"
      borderRadius="xl"
      p="lg"
      bg={colors.surface.main}
      borderWidth="thin"
      borderColor={colors.border.card}
      shadow="card"
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      {content}
    </Pressable>
  );
});

interface PlatformsCarouselProps {
  platforms: readonly PlatformResource[];
  isLoading: boolean;
  onOpen: () => void;
}

/** "My platforms": swipeable follower cards, primary first, then a dashed card to link another. */
const PlatformsCarouselComponent: React.FC<PlatformsCarouselProps> = ({ platforms, isLoading, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'add', ViewStyle> => ({
      add: {
        width: ADD_WIDTH,
        height: CARD_HEIGHT,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
    }),
    [colors.border.default],
  );

  const sorted = [...platforms].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  return (
    <Box gap="md">
      <Box px="xl">
        <SectionHeader
          title={t('account.profile.platforms.title')}
          action={{ label: t('account.profile.platforms.manage'), onPress: onOpen }}
        />
      </Box>
      <Rail shadow="card" snapInterval={CARD_WIDTH + spacing.md}>
        {isLoading
          ? SKELETON_CARDS.map(key => <Skeleton key={key} width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius="xl" />)
          : sorted.map(platform => <PlatformCard key={platform.id} platform={platform} onPress={onOpen} />)}
        <Pressable
          style={styles.add}
          borderRadius="xl"
          align="center"
          justify="center"
          gap="sm"
          onPress={onOpen}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t('account.profile.platforms.add')}
        >
          <Box width={ADD_ICON} height={ADD_ICON} borderRadius="full" bg={colors.interactive.soft} align="center" justify="center">
            <Plus size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          <Text variant="buttonSmall" color={colors.interactive.text} align="center">
            {t('account.profile.platforms.add')}
          </Text>
        </Pressable>
      </Rail>
    </Box>
  );
};

export const PlatformsCarousel = memo(PlatformsCarouselComponent);
