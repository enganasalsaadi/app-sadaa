import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, StatusPill, Text, TierBadge } from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';
import { formatFollowers, resolvePlatformIssue } from '../utils/platformsLayout';
import { PlatformMark } from './PlatformMark';

const SWATCH_WIDTH = moderateScale(6);

interface AudienceRowProps {
  platform: PlatformResource;
  /** Its shade in the audience bar above, so row and segment read as one. */
  swatch: string;
  onPress: (id: string) => void;
}

/**
 * One account: its bar shade, mark, name (primary marked), handle and at most one
 * attention label; followers and tier at the reading end.
 */
const AudienceRowComponent: React.FC<AudienceRowProps> = ({ platform, swatch, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const handlePress = useCallback(() => onPress(platform.id), [onPress, platform.id]);
  const issue = resolvePlatformIssue(platform);
  const labelOptions = { platform: platform.platform_label, username: platform.username };

  return (
    <Pressable
      row
      align="center"
      gap="md"
      py="md"
      minHeight={sizes.button.xl}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        platform.is_primary
          ? t('marketplace.creatorHome.platforms.openPrimary', labelOptions)
          : t('marketplace.creatorHome.platforms.open', labelOptions)
      }
    >
      <Box width={SWATCH_WIDTH} height={sizes.avatar.md} borderRadius="full" bg={swatch} />
      <PlatformMark platform={platform.platform} />
      <Box flex={1} gap="xs">
        <Box row align="center" gap="xs">
          <Text variant="bodyMedium" numberOfLines={1} style={styles.shrink}>
            {platform.platform_label}
          </Text>
          {platform.is_primary ? (
            <StatusPill label={t('account.platforms.primary')} tone="interactive" icon={Star} size="sm" />
          ) : null}
        </Box>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          @{platform.username}
        </Text>
        {issue ? (
          <Box alignSelf="flex-start">
            <StatusPill label={t(issue.labelKey)} tone={issue.tone} icon={issue.icon} size="sm" />
          </Box>
        ) : null}
      </Box>
      <Box align="flex-end" gap="xs">
        <Box row align="baseline" gap="xs">
          <Text variant="title" numberOfLines={1}>
            {formatFollowers(platform.follower_count)}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t('marketplace.creatorHome.platforms.followers')}
          </Text>
        </Box>
        {platform.follower_tier ? (
          <TierBadge tier={platform.follower_tier} size="sm" interactive={false} />
        ) : null}
      </Box>
    </Pressable>
  );
};

export const AudienceRow = memo(AudienceRowComponent);
