import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, SocialPlatformIcon, Text, TierBadge } from '@/shared/ui';
import type { MediaKitPlatform } from '../../types/mediaKit';
import { MediaKitRail } from './MediaKitRail';

const CARD_WIDTH = moderateScale(152);
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

const PlatformCard = memo<{ platform: MediaKitPlatform }>(({ platform }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const followers = formatNumber(platform.follower_count, COMPACT);

  return (
    <Card
      width={CARD_WIDTH}
      p="lg"
      accessibilityLabel={t('account.mediaKit.showcase.platformA11y', {
        platform: platform.platform_label,
        followers,
      })}
    >
      <Box gap="md">
        <Box row align="center" justify="space-between">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <SocialPlatformIcon platform={platform.platform} size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          {platform.follower_tier ? (
            <TierBadge tier={platform.follower_tier} size="xs" interactive={false} />
          ) : null}
        </Box>
        <Box gap="xs">
          <Box row align="center" gap="xs">
            <Text variant="h4">{followers}</Text>
            {platform.follower_count_verified ? (
              <CheckCircle2
                size={sizes.icon.xs}
                color={colors.status.success.main}
                accessibilityLabel={t('account.mediaKit.verifiedFollowers')}
              />
            ) : null}
          </Box>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t('account.mediaKit.previewScreen.username', { username: platform.username })}
          </Text>
        </Box>
      </Box>
    </Card>
  );
});

/** Linked platforms as cards in a row: where the creator posts and how big each audience is. */
const MediaKitPlatformsRailComponent: React.FC<{ platforms: readonly MediaKitPlatform[] }> = ({
  platforms,
}) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  if (platforms.length === 0) return null;

  return (
    <MediaKitRail
      title={t('account.mediaKit.previewScreen.platforms')}
      snapInterval={CARD_WIDTH + spacing.md}
    >
      {platforms.map(platform => (
        <PlatformCard key={platform.platform} platform={platform} />
      ))}
    </MediaKitRail>
  );
};

export const MediaKitPlatformsRail = memo(MediaKitPlatformsRailComponent);
