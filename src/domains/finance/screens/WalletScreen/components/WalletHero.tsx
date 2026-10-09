import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, LiveIsland, MoneyText, Skeleton, Text, useHeroCompact } from '@/shared/ui';
import type { WalletTileTarget } from '../../../constants';
import type { WalletHeroModel } from '../hooks/useWalletHero';
import { HeroTile } from './HeroTile';
import { MonthInPill } from './MonthInPill';

const NO_VALUE = '—';
const SKELETON_BALANCE = '60%';

export interface WalletHeroAction {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** The role's money action row: one `onBrand` primary + one glass secondary (rule 09 §2.1). */
export interface WalletHeroActions {
  primary: WalletHeroAction;
  secondary: WalletHeroAction;
}

interface WalletHeroProps {
  title: string;
  hero: WalletHeroModel;
  hidden: boolean;
  /** `null` = the role's action screens aren't built yet. */
  actions: WalletHeroActions | null;
  onOpenTile: (target: WalletTileTarget) => void;
}

const ActionRow = memo<{ actions: WalletHeroActions }>(({ actions }) => (
  <Box row gap="sm">
    <Box flex={1}>
      <CustomButton
        title={actions.primary.label}
        variant="onBrand"
        size="md"
        onPress={actions.primary.onPress}
        disabled={actions.primary.disabled}
      />
    </Box>
    <Box flex={1}>
      <CustomButton
        title={actions.secondary.label}
        variant="glass"
        size="md"
        onPress={actions.secondary.onPress}
        disabled={actions.secondary.disabled}
      />
    </Box>
  </Box>
));

const Balance = memo<{ hero: WalletHeroModel; hidden: boolean; compact: boolean }>(
  ({ hero, hidden, compact }) => {
    const { colors, typography } = useTheme();
    const size = compact ? 'hero' : 'display';
    if (hero.available) {
      return (
        <MoneyText
          value={hero.available}
          size={size}
          tone="onBrand"
          splitFraction
          rounding="down"
          animated
          hidden={hidden}
        />
      );
    }
    const variant = compact ? 'amountHero' : 'amountDisplay';
    return hero.status === 'error' ? (
      <Text variant={variant} color={colors.text.onBrand}>
        {NO_VALUE}
      </Text>
    ) : (
      <Skeleton
        width={SKELETON_BALANCE}
        height={typography[variant].lineHeight}
        borderRadius="md"
        surface="brand"
      />
    );
  },
);

/**
 * Navy balance hero, transparent: Layout paints the gradient and lights behind it
 * (`heroBackdrop="brandGlow"`). Title beside the header's eye action, the available
 * balance at display size with a still mint dot, this month's credits, two glass tiles
 * and the one blocker as a live island. Only figures the server sends (rule 09).
 * Compact (keyboard / short screens): hero-size balance, no month pill or island message.
 */
const WalletHeroComponent: React.FC<WalletHeroProps> = ({ title, hero, hidden, actions, onOpenTile }) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();

  const styles = useStyles(
    ({ spacing }) => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the eye action at the reading end of the header row.
      titleRow: { minHeight: sizes.iconButton.md, paddingEnd: sizes.iconButton.md + spacing.sm },
    }),
    [top, sizes.iconButton.md],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap={compact ? 'md' : 'lg'}>
      <Box justify="center" style={styles.titleRow}>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
      </Box>

      <Box gap="xs">
        <Box row align="center" gap="sm">
          <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.glass.iconMoney} />
          <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
            {hero.availableLabel}
          </Text>
        </Box>
        <Balance hero={hero} hidden={hidden} compact={compact} />
        {hero.monthIn && !hidden && !compact ? (
          <Box pt="xs">
            <MonthInPill value={hero.monthIn} labelKey={hero.monthInKey} />
          </Box>
        ) : null}
      </Box>

      {hero.status === 'loading' ? (
        <Box row gap="sm">
          <Skeleton width="48%" height={sizes.button.xl} borderRadius="lg" surface="brand" />
          <Skeleton width="48%" height={sizes.button.xl} borderRadius="lg" surface="brand" />
        </Box>
      ) : hero.tiles.length > 0 ? (
        <Box row gap="sm">
          {hero.tiles.map(tile => (
            <HeroTile key={tile.key} tile={tile} hidden={hidden} onOpen={onOpenTile} />
          ))}
        </Box>
      ) : null}

      {actions ? <ActionRow actions={actions} /> : null}

      {hero.island ? (
        <LiveIsland
          key={hero.island.key}
          title={hero.island.title}
          message={compact ? undefined : hero.island.message}
          tone={hero.island.tone}
          onPress={hero.island.onPress}
          accessibilityHint={hero.island.hint}
        />
      ) : null}
    </Box>
  );
};

export const WalletHero = memo(WalletHeroComponent);
