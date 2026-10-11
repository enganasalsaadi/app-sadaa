import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Heart, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Badge, Box, Pressable, Skeleton, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const SKELETON_NAME = '60%';

type Hero = BrandHomeScreenModel['hero'];

interface HomeTopBarProps {
  hero: Hero;
  unread: number;
  onOpenProfile: () => void;
  onOpenShortlist: () => void;
  onOpenNotifications: () => void;
}

/** 44pt round surface button with an optional count badge on its corner. */
const RoundButton = memo<{
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  badge?: number;
}>(({ icon: Icon, onPress, accessibilityLabel, badge }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    badge: { position: 'absolute' as const, top: -spacing.xs, end: -spacing.xs },
  }), []);
  return (
    <Pressable
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      borderRadius="full"
      align="center"
      justify="center"
      bg={colors.surface.main}
      shadow="sm"
      onPress={onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon size={sizes.icon.sm} color={colors.icon.primary} />
      {badge ? (
        <Box style={styles.badge} pointerEvents="none">
          <Badge count={badge} />
        </Box>
      ) : null}
    </Pressable>
  );
});

/**
 * Greeting row: day-part greeting over "company · city" (opens the account), then the
 * shortlist ❤️ and the inbox 🔔. Money stays off this row: it gets its own quiet line below.
 */
const HomeTopBarComponent: React.FC<HomeTopBarProps> = ({
  hero,
  unread,
  onOpenProfile,
  onOpenShortlist,
  onOpenNotifications,
}) => {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const place = [hero.companyName, hero.governorate].filter(Boolean).join(' · ');

  return (
    <Box row align="center" gap="sm" px="xl" pt="sm">
      <Pressable
        flex={1}
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.openProfile', { name: hero.companyName })}
      >
        <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
          {hero.greeting}
        </Text>
        {hero.status === 'loading' ? (
          <Skeleton width={SKELETON_NAME} height={typography.title.lineHeight} borderRadius="xs" />
        ) : (
          <Text variant="title" numberOfLines={1}>
            {place}
          </Text>
        )}
      </Pressable>
      <RoundButton icon={Heart} onPress={onOpenShortlist} accessibilityLabel={t('marketplace.shortlist.open')} />
      <RoundButton
        icon={Bell}
        onPress={onOpenNotifications}
        badge={unread}
        accessibilityLabel={
          unread
            ? t('notifications.inbox.openUnread', { count: unread })
            : t('notifications.inbox.title')
        }
      />
    </Box>
  );
};

export const HomeTopBar = memo(HomeTopBarComponent);
