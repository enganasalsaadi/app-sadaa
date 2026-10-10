import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, LiveIsland, Pressable, Skeleton, Text, useHeroCompact } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { CompanyMark } from './CompanyMark';
import { HeroWalletCard } from './HeroWalletCard';

const SKELETON_NAME = '50%';

type Hero = BrandHomeScreenModel['hero'];
type Island = NonNullable<BrandHomeScreenModel['island']>;

interface BrandHomeHeroProps {
  hero: Hero;
  /** The one blocker the server picked, as the hero's live island (rule 09 §3.1). */
  island: Island | null;
  hidden: boolean;
  onToggleHidden: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
}

const Identity = memo<{ hero: Hero; compact: boolean; onOpenProfile: () => void }>(
  ({ hero, compact, onOpenProfile }) => {
    const { t } = useTranslation();
    const { colors, sizes, typography } = useTheme();
    const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
    const nameVariant = compact ? 'title' : 'h3';
    const nameLoading = hero.status === 'loading';

    return (
      <Pressable
        row
        align="center"
        gap={compact ? 'md' : 'lg'}
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.openProfile', { name: hero.companyName })}
      >
        <CompanyMark size={compact ? sizes.avatar.sm : sizes.iconButton.md} />
        <Box flex={1} gap="xs">
          {nameLoading ? (
            <Skeleton
              width={SKELETON_NAME}
              height={typography[nameVariant].lineHeight}
              borderRadius="xs"
              surface="brand"
            />
          ) : (
            <Text variant={nameVariant} color={colors.text.onBrand} numberOfLines={1}>
              {hero.companyName}
            </Text>
          )}
          {hero.governorate && !compact ? (
            <Box row align="center" gap="xs">
              <MapPin size={sizes.icon.xs} color={colors.text.onBrandMuted} />
              <Box style={styles.shrink}>
                <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
                  {hero.governorate}
                </Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Pressable>
    );
  },
);

const HeroIsland = memo<{ island: Island; compact: boolean }>(({ island, compact }) => (
  <LiveIsland
    key={island.key}
    title={island.title}
    message={compact ? undefined : island.message}
    tone={island.tone}
    onPress={island.onPress}
    accessibilityHint={island.hint}
  />
));

/**
 * Brand greeting band, transparent: Layout paints the gradient and lights behind it
 * (`heroBackdrop="brandGlow"`). The greeting owns the header row next to the bell; below it
 * the company and its governorate, the glass wallet strip and the server's one blocker as a
 * live island. Compact (keyboard / short screens): identity beside the bell, one-line wallet,
 * island title only.
 */
const BrandHomeHeroComponent: React.FC<BrandHomeHeroProps> = ({
  hero,
  island,
  hidden,
  onToggleHidden,
  onOpenWallet,
  onOpenProfile,
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

  const wallet = (
    <HeroWalletCard
      hero={hero}
      hidden={hidden}
      compact={compact}
      onToggleHidden={onToggleHidden}
      onOpenWallet={onOpenWallet}
    />
  );

  if (compact) {
    return (
      <Box style={styles.container} px="xl" pb="4xl" gap="md">
        <Box justify="center" style={styles.headerRow}>
          <Identity hero={hero} compact onOpenProfile={onOpenProfile} />
        </Box>
        {island ? <HeroIsland island={island} compact /> : null}
        {wallet}
      </Box>
    );
  }

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="lg">
      <Box justify="center" style={styles.headerRow}>
        <Text variant="body" color={colors.text.onBrandMuted} numberOfLines={1}>
          {hero.greeting}
        </Text>
      </Box>
      <Identity hero={hero} compact={false} onOpenProfile={onOpenProfile} />
      {wallet}
      {island ? <HeroIsland island={island} compact={false} /> : null}
    </Box>
  );
};

export const BrandHomeHero = memo(BrandHomeHeroComponent);
