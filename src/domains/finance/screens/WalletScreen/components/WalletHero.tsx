import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, LiveIsland, Text, useHeroCompact } from '@/shared/ui';
import type { WalletTileTarget } from '../../../constants';
import type { WalletHeroModel } from '../hooks/useWalletHero';
import { BalanceDial } from './BalanceDial';
import { DialLegend } from './DialLegend';

/** The primary carries a little more weight than its history twin. */
const PRIMARY_FLEX = 1.35;

export interface WalletHeroAction {
  label: string;
  icon: LucideIcon;
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
  actions: WalletHeroActions;
  /** Active escrows, for the escrow arc's chip. */
  dealsCount: number;
  onOpenTile: (target: WalletTileTarget) => void;
}

const ActionRow = memo<{ actions: WalletHeroActions }>(({ actions }) => {
  const { primary, secondary } = actions;
  const PrimaryIcon = primary.icon;
  const SecondaryIcon = secondary.icon;
  return (
    <Box row gap="sm">
      <Box flex={PRIMARY_FLEX}>
        <CustomButton
          title={primary.label}
          variant="onBrand"
          size="lg"
          leftIcon={<PrimaryIcon />}
          onPress={primary.onPress}
          disabled={primary.disabled}
        />
      </Box>
      <Box flex={1}>
        <CustomButton
          title={secondary.label}
          variant="glass"
          size="lg"
          leftIcon={<SecondaryIcon />}
          onPress={secondary.onPress}
          disabled={secondary.disabled}
        />
      </Box>
    </Box>
  );
});

/**
 * Navy balance hero, transparent: Layout paints the live gradient and its lights as one
 * block with rounded bottom corners (`heroBackdrop="brandRounded"`). Title beside the
 * header's eye action, the balance dial and its legend, the role's two actions and the
 * one blocker as a live island. Only figures the server sends (rule 09).
 * Compact (keyboard / short screens): a smaller dial, no island message.
 */
const WalletHeroComponent: React.FC<WalletHeroProps> = ({ title, hero, hidden, actions, dealsCount, onOpenTile }) => {
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
    <Box style={styles.container} px="xl" pb="2xl" gap={compact ? 'md' : 'lg'}>
      <Box justify="center" style={styles.titleRow}>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
      </Box>

      <BalanceDial
        status={hero.status}
        segments={hero.segments}
        selectedKey={hero.selectedKey}
        availableLabel={hero.availableLabel}
        hidden={hidden}
        compact={compact}
        monthIn={hero.monthIn}
        monthInKey={hero.monthInKey}
        dealsCount={dealsCount}
        onOpenTile={onOpenTile}
      />

      <DialLegend
        segments={hero.segments}
        selectedKey={hero.selectedKey}
        hidden={hidden}
        loading={hero.status === 'loading'}
        onSelect={hero.selectSegment}
      />

      <ActionRow actions={actions} />

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
