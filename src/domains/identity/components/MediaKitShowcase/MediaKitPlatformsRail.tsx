import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, SocialPlatformIcon, Text } from '@/shared/ui';
import type { MediaKitPlatform } from '../../types/mediaKit';
import { MediaKitRail } from './MediaKitRail';

/** Room for `lg` padding (rule 09 §3.2) beside the platform tile; the skeleton reserves the same width. */
export const PLATFORM_CARD_WIDTH = moderateScale(160);
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

/** One platform: icon, follower count (✓ when the server checked it) and the handle. */
const PlatformCard = memo<{ platform: MediaKitPlatform }>(({ platform }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const followers = formatNumber(platform.follower_count, COMPACT);

  return (
    <Card
      width={PLATFORM_CARD_WIDTH}
      p="lg"
      accessibilityLabel={t('account.mediaKit.showcase.platformA11y', {
        platform: platform.platform_label,
        followers,
      })}
    >
      <Box row align="center" gap="sm">
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="md"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
        >
          <SocialPlatformIcon platform={platform.platform} size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Box row align="center" gap="xs">
            <Text variant="title">{followers}</Text>
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

/** Linked platforms right under the identity: where the creator posts and how big each audience is. */
const MediaKitPlatformsRailComponent: React.FC<{ platforms: readonly MediaKitPlatform[] }> = ({
  platforms,
}) => {
  const { spacing } = useTheme();
  if (platforms.length === 0) return null;

  return (
    <MediaKitRail snapInterval={PLATFORM_CARD_WIDTH + spacing.md}>
      {platforms.map(platform => (
        <PlatformCard key={platform.platform} platform={platform} />
      ))}
    </MediaKitRail>
  );
};

export const MediaKitPlatformsRail = memo(MediaKitPlatformsRailComponent);
