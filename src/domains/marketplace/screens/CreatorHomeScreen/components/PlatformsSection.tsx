import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomButton,
  Notice,
  SectionHeader,
  Skeleton,
  Text,
} from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { orderPlatforms } from '../utils/platformsLayout';
import { AddPlatformRow } from './AddPlatformRow';
import { PlatformRow } from './PlatformRow';

/** Placeholder ≈ a loaded row (mark beside name, handle and tier). */
const ROW_SKELETON_HEIGHT = moderateScale(76);
const SKELETON_ROWS = ['a', 'b'] as const;

interface PlatformsSectionProps {
  platforms: CreatorHomeScreenModel['platforms'];
  onOpenPlatform: (id: string) => void;
  onManage: () => void;
}

/**
 * "My platforms": compact rows stacked down the page, primary first, closed by
 * "add platform" (bounded: one per platform, ≤ 6, so no virtualised list).
 */
const PlatformsSectionComponent: React.FC<PlatformsSectionProps> = ({
  platforms,
  onOpenPlatform,
  onManage,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const ordered = useMemo(
    () => orderPlatforms(platforms.items),
    [platforms.items],
  );
  const hasItems = platforms.items.length > 0;

  const renderBody = () => {
    if (platforms.isLoading) {
      return (
        <Box gap="sm">
          {SKELETON_ROWS.map(key => (
            <Skeleton
              key={key}
              width="100%"
              height={ROW_SKELETON_HEIGHT}
              borderRadius="lg"
            />
          ))}
        </Box>
      );
    }
    if (platforms.isError) {
      return (
        <Notice
          tone="danger"
          message={t('marketplace.creatorHome.platforms.loadFailed')}
          action={{ label: t('common.retry'), onPress: platforms.retry }}
        />
      );
    }
    if (!hasItems) {
      return (
        <Card shadow="none" p="lg">
          <Box gap="md">
            <Text variant="body" color={colors.text.secondary}>
              {t('marketplace.creatorHome.platforms.addHint')}
            </Text>
            <CustomButton
              title={t('marketplace.creatorHome.platforms.add')}
              variant="secondary"
              size="md"
              leftIcon={<Plus />}
              onPress={onManage}
              fullWidth
            />
          </Box>
        </Card>
      );
    }
    return (
      <Box gap="sm">
        {ordered.map(platform => (
          <PlatformRow
            key={platform.id}
            platform={platform}
            onPress={onOpenPlatform}
          />
        ))}
        <AddPlatformRow onPress={onManage} />
      </Box>
    );
  };

  return (
    <Box px="xl" gap="md">
      <SectionHeader
        title={t('account.profile.platforms.title')}
        emphasis="strong"
        action={
          hasItems
            ? {
                label: t('marketplace.creatorHome.platforms.manage'),
                onPress: onManage,
              }
            : undefined
        }
      />
      {renderBody()}
    </Box>
  );
};

export const PlatformsSection = memo(PlatformsSectionComponent);
