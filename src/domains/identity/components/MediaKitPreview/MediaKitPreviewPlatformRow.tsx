import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, SocialPlatformIcon, Text, TierBadge } from '@/shared/ui';
import type { MediaKitPlatform } from '../../types/mediaKit';

/** One linked platform as a brand sees it: where, who, how big. */
const MediaKitPreviewPlatformRowComponent: React.FC<{ platform: MediaKitPlatform }> = ({
  platform,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box row align="center" gap="md" py="md">
      <SocialPlatformIcon
        platform={platform.platform}
        size={sizes.icon.md}
        color={colors.interactive.main}
      />
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" numberOfLines={1}>
          {platform.platform_label}
        </Text>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {t('account.mediaKit.previewScreen.username', { username: platform.username })}
        </Text>
      </Box>
      <Box align="flex-end" gap="xs">
        <Box row align="center" gap="xs">
          <Text variant="bodySmall" color={colors.text.primary}>
            {t('account.mediaKit.followers', {
              count: formatNumber(platform.follower_count, {
                notation: 'compact',
                maximumFractionDigits: 1,
              }),
            })}
          </Text>
          {platform.follower_count_verified ? (
            <CheckCircle2
              size={sizes.icon.xs}
              color={colors.status.success.main}
              accessibilityLabel={t('account.mediaKit.verifiedFollowers')}
            />
          ) : null}
        </Box>
        {platform.follower_tier ? <TierBadge tier={platform.follower_tier} size="xs" /> : null}
      </Box>
    </Box>
  );
};

export const MediaKitPreviewPlatformRow = memo(MediaKitPreviewPlatformRowComponent);
