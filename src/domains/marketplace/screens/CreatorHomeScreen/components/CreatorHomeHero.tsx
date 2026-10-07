import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, SocialPlatformIcon, Text, TierBadge, useHeroCompact } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { HeroAvatar } from './HeroAvatar';
import { HeroKpiStrip } from './HeroKpiStrip';

type Hero = CreatorHomeScreenModel['hero'];

interface CreatorHomeHeroProps {
  hero: Hero;
  kpis: CreatorHomeScreenModel['kpis'];
  onOpenProfile: () => void;
  onOpenInsights: () => void;
}

const HeroName = memo<{ hero: Hero; compact: boolean }>(({ hero, compact }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({
    // Lets the name ellipsize next to its badges instead of pushing them out.
    shrink: { flexShrink: 1 },
  }));

  return (
    <Box row align="center" gap="xs">
      <Box style={styles.shrink}>
        <Text variant={compact ? 'title' : 'h3'} color={colors.text.onBrand} numberOfLines={1}>
          {hero.displayName || t('marketplace.creatorHome.greetingFallback')}
        </Text>
      </Box>
      {hero.isVerified ? (
        <BadgeCheck
          size={sizes.icon.sm}
          color={colors.premium.main}
          accessibilityLabel={t('marketplace.creatorHome.verified')}
        />
      ) : null}
      {compact && hero.tier ? <TierBadge tier={hero.tier} size="xs" /> : null}
    </Box>
  );
});

/** Tier pill and primary handle, on their own line so the name keeps the full width. */
const HeroMeta = memo<{ hero: Hero }>(({ hero }) => {
  const { colors, sizes } = useTheme();
  const { tier, primaryPlatform } = hero;
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  if (!tier && !primaryPlatform) return null;

  return (
    <Box row align="center" gap="sm">
      {tier ? <TierBadge tier={tier} size="sm" /> : null}
      {tier && primaryPlatform ? (
        <Box width={sizes.dot.sm} height={sizes.dot.sm} borderRadius="full" bg={colors.glass.border} />
      ) : null}
      {primaryPlatform ? (
        <Box row align="center" gap="xs" style={styles.shrink}>
          {isSocialPlatform(primaryPlatform.platform) ? (
            <SocialPlatformIcon
              platform={primaryPlatform.platform}
              size={sizes.icon.xs}
              color={colors.text.onBrandMuted}
            />
          ) : null}
          <Box style={styles.shrink}>
            <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
              @{primaryPlatform.username}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
});

/**
 * Navy greeting band, transparent: Layout paints the gradient behind it
 * (`heroBackdrop="brandGlow"`). The greeting owns the header row next to the bell; the
 * identity block below gets the full width, then the glass KPI strip. Compact
 * (keyboard / short screens): one identity row beside the bell, no greeting or handle.
 */
const CreatorHomeHeroComponent: React.FC<CreatorHomeHeroProps> = ({
  hero,
  kpis,
  onOpenProfile,
  onOpenInsights,
}) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();

  const styles = useStyles(
    ({ spacing }) => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the bell at the reading end of the header row.
      headerRow: { minHeight: sizes.iconButton.md, paddingEnd: sizes.iconButton.md + spacing.sm },
    }),
    [top, sizes.iconButton.md],
  );

  if (compact) {
    return (
      <Box style={styles.container} px="xl" pb="2xl" gap="md">
        <Box row align="center" gap="md" style={styles.headerRow}>
          <HeroAvatar uri={hero.avatarUrl} size={sizes.avatar.md} onPress={onOpenProfile} />
          <Box flex={1}>
            <HeroName hero={hero} compact />
          </Box>
        </Box>
        <HeroKpiStrip kpis={kpis} compact onOpenInsights={onOpenInsights} />
      </Box>
    );
  }

  return (
    <Box style={styles.container} px="xl" pb="2xl" gap="lg">
      <Box justify="center" style={styles.headerRow}>
        <Text variant="body" color={colors.text.onBrandMuted} numberOfLines={1}>
          {hero.greeting}
        </Text>
      </Box>

      <Box row align="center" gap="lg">
        <HeroAvatar uri={hero.avatarUrl} size={sizes.avatar.lg} onPress={onOpenProfile} />
        <Box flex={1} gap="sm">
          <HeroName hero={hero} compact={false} />
          <HeroMeta hero={hero} />
        </Box>
      </Box>

      <HeroKpiStrip kpis={kpis} compact={false} onOpenInsights={onOpenInsights} />
    </Box>
  );
};

export const CreatorHomeHero = memo(CreatorHomeHeroComponent);
