import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PauseCircle } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  Notice,
  SectionHeader,
  Skeleton,
  SocialPlatformIcon,
  StatusPill,
  Tag,
  Text,
  TierBadge,
} from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';
import { PLATFORM_STATUS_PILL } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const TILE_WIDTH = moderateScale(148);
const SKELETON_TILES = ['a', 'b', 'c'] as const;

interface PlatformTileProps {
  platform: PlatformResource;
  onPress: (id: string) => void;
}

const PlatformTile = memo<PlatformTileProps>(({ platform, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const status = PLATFORM_STATUS_PILL[platform.verification_status];
  const handlePress = useCallback(() => onPress(platform.id), [onPress, platform.id]);

  return (
    <Card
      width={TILE_WIDTH}
      shadow="none"
      p="md"
      onPress={handlePress}
      accessibilityLabel={t('marketplace.creatorHome.platforms.open', {
        platform: platform.platform_label,
        username: platform.username,
      })}
    >
      <Box gap="sm">
        <Box row align="center" justify="space-between" gap="xs">
          {isSocialPlatform(platform.platform) ? (
            <SocialPlatformIcon
              platform={platform.platform}
              size={sizes.icon.md}
              color={colors.interactive.main}
            />
          ) : (
            <Text variant="bodyMedium">{platform.platform_label}</Text>
          )}
          {platform.is_primary ? <Tag label={t('account.platforms.primary')} tone="brand" /> : null}
        </Box>
        <Text variant="bodyMedium" numberOfLines={1}>
          @{platform.username}
        </Text>
        <Box row align="center" gap="xs">
          {platform.follower_tier ? (
            <TierBadge tier={platform.follower_tier} size="xs" interactive={false} />
          ) : null}
          {platform.follower_count != null ? (
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {t('account.platforms.followers', {
                value: formatNumber(platform.follower_count, {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }),
              })}
            </Text>
          ) : null}
        </Box>
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
    </Card>
  );
});

interface PlatformsStripProps {
  platforms: CreatorHomeScreenModel['platforms'];
  onOpenPlatform: (id: string) => void;
  onManage: () => void;
}

/** "My platforms": one swipeable tile per linked account (bounded: one per platform, ≤ 6). */
const PlatformsStripComponent: React.FC<PlatformsStripProps> = ({
  platforms,
  onOpenPlatform,
  onManage,
}) => {
  const { t } = useTranslation();
  const { sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  }));

  const renderBody = () => {
    if (platforms.isLoading) {
      return (
        <Box row px="xl" gap="md">
          {SKELETON_TILES.map(key => (
            <Skeleton key={key} width={TILE_WIDTH} height={sizes.button.lg * 2} borderRadius="lg" />
          ))}
        </Box>
      );
    }
    if (platforms.isError) {
      return (
        <Box px="xl">
          <Notice
            tone="danger"
            message={t('marketplace.creatorHome.platforms.loadFailed')}
            action={{ label: t('common.retry'), onPress: platforms.retry }}
          />
        </Box>
      );
    }
    if (platforms.items.length === 0) {
      return (
        <Box px="xl">
          <Notice
            message={t('account.profile.platforms.empty')}
            action={{ label: t('account.platforms.add'), onPress: onManage }}
          />
        </Box>
      );
    }
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {platforms.items.map(platform => (
          <PlatformTile key={platform.id} platform={platform} onPress={onOpenPlatform} />
        ))}
      </ScrollView>
    );
  };

  return (
    <Box gap="md">
      <Box px="xl">
        <SectionHeader
          title={t('account.profile.platforms.title')}
          action={{ label: t('marketplace.creatorHome.platforms.manage'), onPress: onManage }}
        />
      </Box>
      {renderBody()}
    </Box>
  );
};

export const PlatformsStrip = memo(PlatformsStripComponent);
