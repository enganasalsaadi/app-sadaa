import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text, useHeroCompact } from '@/shared/ui';
import type { MediaKitCardModel } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { HangingSign } from './HangingSign';
import { StorefrontPass } from './StorefrontPass';

interface StorefrontHeroProps {
  hero: CreatorHomeScreenModel['hero'];
  notice: CreatorHomeScreenModel['notice'];
  kpis: CreatorHomeScreenModel['kpis'];
  platforms: CreatorHomeScreenModel['platforms'];
  mediaKit: MediaKitCardModel;
  onOpenPreview: () => void;
  onAddPhoto: () => void;
  onLinkPlatform: () => void;
}

/** Open / closed sign over the pass: a live teal dot when brands can open the kit. */
const StoreState = memo<{ isPublic: boolean | null }>(({ isPublic }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (isPublic === null) return null;
  return (
    <Box row align="center" gap="sm">
      <LiveDot color={isPublic ? colors.glass.iconInteractive : colors.glass.iconWarning} />
      <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
        {t(
          isPublic
            ? 'marketplace.creatorHome.storefront.kickerOpen'
            : 'marketplace.creatorHome.storefront.kickerHidden',
        )}
      </Text>
    </Box>
  );
});

/**
 * «الواجهة» (approved 2026-10-13): Home is the creator's storefront as brands see it.
 * Transparent: Layout paints the live navy and its lights behind it (`brandGlow`). The
 * greeting shares the header row with the bell; below it only the open/closed state, the
 * tilted pass and the one blocker hanging from it as a sign. Everything else lives in the
 * body, so nothing is left half read when the sheet slides over the hero. Only data the
 * app has (rule 09).
 */
const StorefrontHeroComponent: React.FC<StorefrontHeroProps> = ({
  hero,
  notice,
  kpis,
  platforms,
  mediaKit,
  onOpenPreview,
  onAddPhoto,
  onLinkPlatform,
}) => {
  const { t } = useTranslation();
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

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap={compact ? 'lg' : 'xl'}>
      <Box justify="center" style={styles.headerRow}>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {hero.greeting}
        </Text>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1}>
          {hero.displayName || t('marketplace.creatorHome.greetingFallback')}
        </Text>
      </Box>

      <Box gap="md">
        {compact ? null : <StoreState isPublic={mediaKit.isPublic} />}
        {/* No gap: the sign's strings hang straight from the pass's bottom edge. */}
        <Box>
          <StorefrontPass
            hero={hero}
            platforms={platforms}
            reach={kpis.reach}
            mediaKit={mediaKit}
            onOpenPreview={onOpenPreview}
            onAddPhoto={onAddPhoto}
            onLinkPlatform={onLinkPlatform}
          />
          {notice ? <HangingSign key={notice.key} notice={notice} compact={compact} /> : null}
        </Box>
      </Box>
    </Box>
  );
};

export const StorefrontHero = memo(StorefrontHeroComponent);
