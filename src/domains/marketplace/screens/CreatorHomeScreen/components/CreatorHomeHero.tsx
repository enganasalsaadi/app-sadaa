import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  GradientSurface,
  Image,
  Pressable,
  SocialPlatformIcon,
  Text,
  TierBadge,
  useHeroCompact,
} from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const AVATAR = moderateScale(56);
const AVATAR_COMPACT = moderateScale(48);

interface CreatorHomeHeroProps {
  hero: CreatorHomeScreenModel['hero'];
  onOpenProfile: () => void;
}

/**
 * Compact navy greeting band (≤ 25% of the screen): avatar, greeting, tier and the
 * primary handle. Leaves room on top for the overlay header (bell).
 */
const CreatorHomeHeroComponent: React.FC<CreatorHomeHeroProps> = ({ hero, onOpenProfile }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const avatarSize = compact ? AVATAR_COMPACT : AVATAR;
  const { primaryPlatform } = hero;

  const styles = useStyles(
    () => ({
      // Matches the overlay ScreenHeader: inset + vertical padding + one icon-button row.
      container: { paddingTop: top + spacing.sm * 2 + sizes.iconButton.md },
      // Lets one-line texts ellipsize next to their icon instead of pushing it out.
      shrink: { flexShrink: 1 },
    }),
    [top, spacing.sm, sizes.iconButton.md],
  );

  return (
    <GradientSurface variant="brand" style={styles.container} px="xl" pb="xl">
      <Box row align="center" gap="lg">
        <Pressable
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.openProfile')}
        >
          {hero.avatarUrl ? (
            <Image uri={hero.avatarUrl} size={avatarSize} circle />
          ) : (
            <Box
              width={avatarSize}
              height={avatarSize}
              borderRadius="full"
              bg={colors.glass.badge}
              align="center"
              justify="center"
            >
              <User size={sizes.icon.md} color={colors.text.onBrand} />
            </Box>
          )}
        </Pressable>

        <Box flex={1} gap="xs">
          <Box row align="center" gap="sm">
            <Box style={styles.shrink}>
              <Text variant={compact ? 'h4' : 'h3'} color={colors.text.onBrand} numberOfLines={1}>
                {hero.displayName
                  ? t('marketplace.creatorHome.greeting', { name: hero.displayName })
                  : t('marketplace.creatorHome.greetingFallback')}
              </Text>
            </Box>
            {hero.tier ? <TierBadge tier={hero.tier} size="sm" /> : null}
          </Box>
          {primaryPlatform ? (
            <Box row align="center" gap="xs">
              {isSocialPlatform(primaryPlatform.platform) ? (
                <SocialPlatformIcon
                  platform={primaryPlatform.platform}
                  size={sizes.icon.xs}
                  color={colors.text.onBrandMuted}
                />
              ) : null}
              <Box style={styles.shrink}>
                <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
                  @{primaryPlatform.username}
                </Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </GradientSurface>
  );
};

export const CreatorHomeHero = memo(CreatorHomeHeroComponent);
