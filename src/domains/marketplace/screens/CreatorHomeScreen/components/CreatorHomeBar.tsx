import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Share2 } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Pressable, Text, TierBadge } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { HeroAvatar } from './HeroAvatar';

interface CreatorHomeBarProps {
  hero: CreatorHomeScreenModel['hero'];
  onOpenProfile: () => void;
  /** Shown only while the kit is public: the hero's share stays one tap away after it sinks. */
  onShare: (() => void) | null;
}

/**
 * Identity pinned in the navy bar once the hero scrolls away: photo, name, verified
 * mark and tier crest (→ Profile), then share; the bell stays a header action.
 */
const CreatorHomeBarComponent: React.FC<CreatorHomeBarProps> = ({ hero, onOpenProfile, onShare }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const name = hero.displayName || t('marketplace.creatorHome.greetingFallback');

  return (
    <Box row align="center" gap="sm">
      <Pressable
        row
        align="center"
        gap="sm"
        minHeight={sizes.iconButton.md}
        style={styles.shrink}
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.creatorHome.openProfile')}
      >
        <HeroAvatar uri={hero.avatarUrl} size={sizes.avatar.sm} />
        <Box style={styles.shrink}>
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
            {name}
          </Text>
        </Box>
        {hero.isVerified ? (
          <BadgeCheck size={sizes.icon.sm} color={colors.premium.main} />
        ) : null}
        {hero.tier ? <TierBadge tier={hero.tier} size="xs" interactive={false} /> : null}
      </Pressable>
      <Box flex={1} />
      {onShare ? (
        <IconButton
          icon={Share2}
          variant="soft"
          tone="onBrand"
          onPress={onShare}
          accessibilityLabel={t('marketplace.creatorHome.hero.shareA11y')}
        />
      ) : null}
    </Box>
  );
};

export const CreatorHomeBar = memo(CreatorHomeBarComponent);
