import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link2, Plus } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomButton,
  Divider,
  Notice,
  Pressable,
  SectionHeader,
  Skeleton,
  Text,
} from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { orderPlatforms } from '../utils/platformsLayout';
import { AudienceRow } from './AudienceRow';

const BAR_HEIGHT = moderateScale(12);
const ROW_SKELETON_HEIGHT = moderateScale(60);
const SKELETON_ROWS = ['a', 'b'] as const;

interface AudienceSectionProps {
  platforms: CreatorHomeScreenModel['platforms'];
  onOpenPlatform: (id: string) => void;
  onManage: () => void;
}

/** Followers split by platform as one bar; accounts that report no count stay off it. */
const AudienceBar = memo<{ items: readonly PlatformResource[]; shades: readonly string[] }>(
  ({ items, shades }) => {
    const counted = items
      .map((platform, index) => ({ platform, shade: shades[index % shades.length] ?? shades[0] }))
      .filter(entry => (entry.platform.follower_count ?? 0) > 0);
    if (counted.length === 0) return null;
    return (
      <Box row gap="xs" height={BAR_HEIGHT} borderRadius="full" overflow="hidden" pointerEvents="none">
        {counted.map(({ platform, shade }) => (
          <Box key={platform.id} flex={platform.follower_count ?? 0} bg={shade} />
        ))}
      </Box>
    );
  },
);

const AddPlatformRow = memo<{ onPress: () => void }>(({ onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'dashed', ViewStyle> => ({
      dashed: { borderStyle: 'dashed', borderWidth: borderWidths.sm, borderColor: colors.border.strong },
    }),
    [colors.border.strong],
  );
  return (
    <Pressable
      row
      align="center"
      justify="center"
      gap="sm"
      minHeight={sizes.button.lg}
      borderRadius="md"
      style={styles.dashed}
      onPress={onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.creatorHome.platforms.add')}
    >
      <Plus size={sizes.icon.sm} color={colors.interactive.main} />
      <Text variant="bodyMedium" color={colors.interactive.text}>
        {t('marketplace.creatorHome.platforms.add')}
      </Text>
    </Pressable>
  );
});

/** Nothing linked yet: an invitation, not an empty box. */
const NoPlatforms = memo<{ onAdd: () => void }>(({ onAdd }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <Link2 size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title">{t('marketplace.creatorHome.platforms.emptyTitle')}</Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.creatorHome.platforms.addHint')}
            </Text>
          </Box>
        </Box>
        <CustomButton
          title={t('marketplace.creatorHome.platforms.add')}
          variant="secondary"
          size="md"
          leftIcon={<Plus />}
          onPress={onAdd}
          fullWidth
        />
      </Box>
    </Card>
  );
});

/**
 * «جمهورك»: one bar of where the followers are, then a row per account in the same
 * shades (primary first), closed by "add platform". Bounded (one account per platform),
 * so no virtualised list.
 */
const AudienceSectionComponent: React.FC<AudienceSectionProps> = ({ platforms, onOpenPlatform, onManage }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const ordered = useMemo(() => orderPlatforms(platforms.items), [platforms.items]);
  const shades = colors.storefront.audience;
  const hasItems = ordered.length > 0;

  const renderBody = () => {
    if (platforms.isLoading) {
      return (
        <Box gap="sm">
          {SKELETON_ROWS.map(key => (
            <Skeleton key={key} width="100%" height={ROW_SKELETON_HEIGHT} borderRadius="lg" />
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
    if (!hasItems) return <NoPlatforms onAdd={onManage} />;
    return (
      <Card px="lg" py="lg">
        <Box gap="sm">
          <AudienceBar items={ordered} shades={shades} />
          <Box>
            {ordered.map((platform, index) => (
              <React.Fragment key={platform.id}>
                {index > 0 ? <Divider /> : null}
                <AudienceRow
                  platform={platform}
                  swatch={shades[index % shades.length] ?? colors.interactive.main}
                  onPress={onOpenPlatform}
                />
              </React.Fragment>
            ))}
          </Box>
          <AddPlatformRow onPress={onManage} />
        </Box>
      </Card>
    );
  };

  return (
    <Box gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.platforms.title')}
        emphasis="strong"
        action={hasItems ? { label: t('marketplace.creatorHome.platforms.manage'), onPress: onManage } : undefined}
      />
      {renderBody()}
    </Box>
  );
};

export const AudienceSection = memo(AudienceSectionComponent);
