import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { formatDate, formatNumber } from '@/core/i18n';
import { isSocialPlatform } from '@/shared/utils';
import { Box, Card, IconButton, SocialPlatformIcon, Text, TierBadge } from '@/shared/ui';
import { formatClock, type PlatformResource } from '@/domains/auth';

interface PlatformAccountCardProps {
  platform: PlatformResource;
  onRefresh: () => void;
  isRefreshing: boolean;
  /** Seconds left after a 429 (2 refreshes per hour). */
  refreshSeconds: number;
}

/** Who the account is and where its tier came from; refresh re-reads the followers. */
const PlatformAccountCardComponent: React.FC<PlatformAccountCardProps> = ({
  platform,
  onRefresh,
  isRefreshing,
  refreshSeconds,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const lastSynced = useMemo(
    () =>
      platform.last_synced_at
        ? formatDate(new Date(platform.last_synced_at), { dateStyle: 'medium' })
        : null,
    [platform.last_synced_at],
  );

  return (
    <Card shadow="none" p="lg">
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box
            width={sizes.button.lg}
            height={sizes.button.lg}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            {isSocialPlatform(platform.platform) ? (
              <SocialPlatformIcon
                platform={platform.platform}
                size={sizes.icon.lg}
                color={colors.interactive.main}
              />
            ) : null}
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title" numberOfLines={1}>
              @{platform.username}
            </Text>
            {platform.display_name ? (
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {platform.display_name}
              </Text>
            ) : null}
          </Box>
          {platform.follower_tier ? <TierBadge tier={platform.follower_tier} size="md" /> : null}
        </Box>

        <Text variant="bodySmall" color={colors.text.secondary}>
          {platform.follower_count != null
            ? t('account.platforms.followers', { value: formatNumber(platform.follower_count) })
            : t('account.platforms.manualTier')}
        </Text>

        {platform.supports_lookup ? (
          <Box row align="center" gap="md">
            <Box flex={1}>
              <Text variant="caption" color={colors.text.tertiary}>
                {refreshSeconds > 0
                  ? t('account.platforms.refreshIn', { time: formatClock(refreshSeconds) })
                  : lastSynced
                  ? t('account.platforms.lastSynced', { date: lastSynced })
                  : t('account.platforms.neverSynced')}
              </Text>
            </Box>
            <IconButton
              icon={RefreshCw}
              accessibilityLabel={t('account.platforms.refresh')}
              onPress={onRefresh}
              variant="soft"
              loading={isRefreshing}
              disabled={refreshSeconds > 0}
            />
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const PlatformAccountCard = memo(PlatformAccountCardComponent);
