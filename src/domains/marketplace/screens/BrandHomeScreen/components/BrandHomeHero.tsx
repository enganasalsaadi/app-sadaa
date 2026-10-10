import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, LiveIsland, Pressable, SearchBar, Skeleton, Text, useHeroCompact } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const SKELETON_NAME = '70%';
/** The header's ♡ + 🔔 sit over the hero row's reading end. */
const HEADER_ACTIONS = 2;
const noop = () => undefined;

type Hero = BrandHomeScreenModel['hero'];
type Island = NonNullable<BrandHomeScreenModel['island']>;

interface BrandHomeHeroProps {
  hero: Hero;
  /** The one blocker the server picked, as a one-line live island (rule 09 §3.1). */
  island: Island | null;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
}

const Identity = memo<{ hero: Hero; onOpenProfile: () => void }>(({ hero, onOpenProfile }) => {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <Pressable
      flex={1}
      justify="center"
      onPress={onOpenProfile}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.brandHome.openProfile', { name: hero.companyName })}
    >
      <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
        {hero.greeting}
      </Text>
      {hero.status === 'loading' ? (
        <Skeleton
          width={SKELETON_NAME}
          height={typography.title.lineHeight}
          borderRadius="xs"
          surface="brand"
        />
      ) : (
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
          {hero.companyName}
        </Text>
      )}
    </Pressable>
  );
});

/** Looks like a search field; the real one lives on Explore and opens with the keyboard up. */
const SearchEntry = memo<{ onOpenSearch: () => void }>(({ onOpenSearch }) => {
  const { t } = useTranslation();
  const placeholder = t('marketplace.explore.searchPlaceholder');
  return (
    <Pressable onPress={onOpenSearch} scaleOnPress accessibilityRole="search" accessibilityLabel={placeholder}>
      <Box pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <SearchBar value="" onChangeText={noop} placeholder={placeholder} />
      </Box>
    </Pressable>
  );
});

/**
 * Discover-home band (rule 09), transparent: Layout paints the gradient and lights behind it
 * (`heroBackdrop="brandGlow"`). One row holds the greeting + company, clear of the
 * header's ♡ and 🔔 (the wallet sits between the rails); the search field and the server's one blocker (title only)
 * sit under it, so creators start high on the screen. Compact (keyboard / short screens):
 * the row alone.
 */
const BrandHomeHeroComponent: React.FC<BrandHomeHeroProps> = ({
  hero,
  island,
  onOpenProfile,
  onOpenSearch,
}) => {
  const { sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();

  const styles = useStyles(
    ({ spacing }) => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      headerRow: {
        minHeight: sizes.iconButton.md,
        paddingEnd: HEADER_ACTIONS * sizes.iconButton.md + spacing.xs,
      },
    }),
    [top, sizes.iconButton.md],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="md">
      <Box row align="center" gap="md" style={styles.headerRow}>
        <Identity hero={hero} onOpenProfile={onOpenProfile} />
      </Box>
      {compact ? null : <SearchEntry onOpenSearch={onOpenSearch} />}
      {island && !compact ? (
        <LiveIsland
          key={island.key}
          title={island.title}
          tone={island.tone}
          onPress={island.onPress}
          accessibilityHint={island.hint}
        />
      ) : null}
    </Box>
  );
};

export const BrandHomeHero = memo(BrandHomeHeroComponent);
