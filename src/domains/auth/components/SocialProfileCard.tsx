import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, UserRound } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Avatar, Box, Card, Skeleton, Text, TierBadge } from '@/shared/ui';
import type { SocialLookupProfile } from '../store';

type SocialProfileCardProps =
  | { loading: true; profile?: undefined }
  | { loading?: false; profile: SocialLookupProfile };

/** The account a lookup found (tier locked), or its placeholder while checking. */
export const SocialProfileCard: React.FC<SocialProfileCardProps> = memo(({ loading, profile }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const avatarSize = sizes.avatar.md;

  if (loading) {
    return (
      <Card
        shadow="none"
        accessibilityLabel={t('auth.influencerOnboarding.socials.lookup.checking')}
      >
        <Box row align="center" gap="md">
          <Skeleton width={avatarSize} height={avatarSize} borderRadius="full" />
          <Box flex={1} gap="xs">
            <Skeleton width="50%" height={sizes.icon.sm} borderRadius="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              {t('auth.influencerOnboarding.socials.lookup.checking')}
            </Text>
          </Box>
        </Box>
      </Card>
    );
  }

  const name = profile.display_name || profile.username;
  const followers =
    profile.follower_count === null
      ? null
      : t('auth.influencerOnboarding.socials.lookup.followers', {
          value: formatNumber(profile.follower_count),
        });

  return (
    <Card shadow="none" bg={colors.interactive.soft}>
      <Box row align="center" gap="md">
        {profile.avatar_url ? (
          <Avatar uri={profile.avatar_url} size={avatarSize} />
        ) : (
          <Box
            width={avatarSize}
            height={avatarSize}
            borderRadius="full"
            bg={colors.surface.elevated}
            align="center"
            justify="center"
          >
            <UserRound size={sizes.icon.md} color={colors.text.tertiary} />
          </Box>
        )}
        <Box flex={1} gap="xs">
          <Box row align="center" gap="xs">
            <Text variant="bodyMedium" numberOfLines={1}>
              {name}
            </Text>
            {profile.is_verified_account ? (
              <BadgeCheck
                size={sizes.icon.sm}
                color={colors.interactive.main}
                accessibilityLabel={t('auth.influencerOnboarding.socials.lookup.verifiedAccount')}
              />
            ) : null}
          </Box>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {followers ? `@${profile.username} · ${followers}` : `@${profile.username}`}
          </Text>
        </Box>
        {profile.follower_tier ? (
          // Shown inside the add-account sheet: a second sheet can't stack on it.
          <TierBadge tier={profile.follower_tier} size="sm" interactive={false} />
        ) : null}
      </Box>
    </Card>
  );
});
