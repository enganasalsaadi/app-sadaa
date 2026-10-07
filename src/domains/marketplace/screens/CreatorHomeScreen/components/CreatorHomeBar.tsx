import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text, TierBadge } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { HeroAvatar } from './HeroAvatar';

interface CreatorHomeBarProps {
  hero: CreatorHomeScreenModel['hero'];
  onOpenProfile: () => void;
}

/**
 * Identity pinned in the navy bar once the hero scrolls away: photo, name, verified
 * mark and tier crest. One tap target (→ Profile); the bell stays a header action.
 */
const CreatorHomeBarComponent: React.FC<CreatorHomeBarProps> = ({ hero, onOpenProfile }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const name = hero.displayName || t('marketplace.creatorHome.greetingFallback');

  return (
    <Box row>
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
    </Box>
  );
};

export const CreatorHomeBar = memo(CreatorHomeBarComponent);
