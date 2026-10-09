import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, PauseCircle } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, Card, SocialPlatformIcon, StatusPill, Tag, Text, TierBadge } from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';
import { PLATFORM_STATUS_PILL } from '../../../constants/platformStatus';

interface PlatformListRowProps {
  platform: PlatformResource;
  onPress: (id: string) => void;
}

/** One linked account: tap opens its page. No inline actions (they live on the detail page). */
const PlatformListRowComponent: React.FC<PlatformListRowProps> = ({ platform, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const status = PLATFORM_STATUS_PILL[platform.verification_status];
  const handlePress = useCallback(() => onPress(platform.id), [onPress, platform.id]);

  return (
    <Box pb="md">
      <Card
        p="lg"
        onPress={handlePress}
        accessibilityLabel={`${platform.platform_label} @${platform.username}`}
      >
        <Box gap="md">
          <Box row align="center" gap="md">
            <Box
              width={sizes.button.md}
              height={sizes.button.md}
              borderRadius="md"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              {isSocialPlatform(platform.platform) ? (
                <SocialPlatformIcon
                  platform={platform.platform}
                  size={sizes.icon.md}
                  color={colors.interactive.main}
                />
              ) : null}
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" numberOfLines={1}>
                {platform.platform_label}
              </Text>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                @{platform.username}
              </Text>
            </Box>
            <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
          </Box>

          <Box row wrap align="center" gap="sm">
            {platform.follower_tier ? (
              <TierBadge tier={platform.follower_tier} size="sm" interactive={false} />
            ) : null}
            {platform.is_primary ? (
              <Tag label={t('account.platforms.primary')} tone="brand" />
            ) : null}
            {status ? (
              <StatusPill label={t(status.labelKey)} tone={status.tone} icon={status.icon} size="sm" />
            ) : null}
            {platform.is_available ? null : (
              <StatusPill
                label={t('account.platforms.unavailable')}
                tone="neutral"
                icon={PauseCircle}
                size="sm"
              />
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export const PlatformListRow = memo(PlatformListRowComponent);
