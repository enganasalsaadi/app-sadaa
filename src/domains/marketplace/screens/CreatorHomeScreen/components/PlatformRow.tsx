import React, { memo, useCallback } from 'react';
import type { TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Card, StatusPill, Text, TierBadge } from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';
import {
  formatFollowers,
  resolvePlatformIssue,
} from '../utils/platformsLayout';
import { PlatformMark } from './PlatformMark';

interface PlatformRowProps {
  platform: PlatformResource;
  onPress: (id: string) => void;
}

/**
 * One compact horizontal card per account: mark · name and handle · followers and tier.
 * The primary account gets a teal frame and a "Primary" pill; a label shows only when
 * something needs attention.
 */
const PlatformRowComponent: React.FC<PlatformRowProps> = ({
  platform,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    (): Record<'shrink', TextStyle> => ({ shrink: { flexShrink: 1 } }),
  );
  const handlePress = useCallback(
    () => onPress(platform.id),
    [onPress, platform.id],
  );
  const issue = resolvePlatformIssue(platform);
  const isPrimary = platform.is_primary;
  const labelOptions = {
    platform: platform.platform_label,
    username: platform.username,
  };

  return (
    <Card
      shadow="none"
      p="md"
      borderColor={isPrimary ? colors.interactive.main : undefined}
      onPress={handlePress}
      accessibilityLabel={
        isPrimary
          ? t('marketplace.creatorHome.platforms.openPrimary', labelOptions)
          : t('marketplace.creatorHome.platforms.open', labelOptions)
      }
    >
      <Box row align="center" gap="md">
        <PlatformMark platform={platform.platform} />

        <Box flex={1} gap="xs">
          <Box row align="center" gap="xs">
            <Text variant="bodyMedium" numberOfLines={1} style={styles.shrink}>
              {platform.platform_label}
            </Text>
            {isPrimary ? (
              <StatusPill
                label={t('account.platforms.primary')}
                tone="interactive"
                icon={Star}
                size="sm"
              />
            ) : null}
          </Box>
          <Text
            variant="caption"
            color={colors.text.secondary}
            numberOfLines={1}
          >
            @{platform.username}
          </Text>
          {issue ? (
            <Box alignSelf="flex-start">
              <StatusPill
                label={t(issue.labelKey)}
                tone={issue.tone}
                icon={issue.icon}
                size="sm"
              />
            </Box>
          ) : null}
        </Box>

        <Box align="flex-end" gap="xs">
          <Box row align="baseline" gap="xs">
            <Text variant="title" numberOfLines={1}>
              {formatFollowers(platform.follower_count)}
            </Text>
            <Text
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={1}
            >
              {t('marketplace.creatorHome.platforms.followers')}
            </Text>
          </Box>
          {platform.follower_tier ? (
            <TierBadge
              tier={platform.follower_tier}
              size="sm"
              interactive={false}
            />
          ) : null}
        </Box>
      </Box>
    </Card>
  );
};

export const PlatformRow = memo(PlatformRowComponent);
