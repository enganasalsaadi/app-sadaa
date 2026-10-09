import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Lock } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Pressable, Text } from '@/shared/ui';
import type { WalletTileTarget } from '../../../constants';
import type { WalletHeroTile } from '../hooks/useWalletHero';

const MASK = '••••';

interface HeroTileProps {
  tile: WalletHeroTile;
  hidden: boolean;
  /** Opens the tile's screen (`tile.opens`). */
  onOpen?: (target: WalletTileTarget) => void;
}

/** Glass tile for a secondary balance (in transfer, in escrow, top-ups in review): compact, rolls once. */
const HeroTileComponent: React.FC<HeroTileProps> = ({ tile, hidden, onOpen }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = tile.kind === 'escrow' ? Lock : Clock;
  const iconColor = tile.kind === 'escrow' ? colors.glass.iconInteractive : colors.glass.iconWarning;
  const value = formatMoney(tile.value, i18n.language, { notation: 'compact', rounding: 'down' });
  const { opens } = tile;
  const handlePress = useCallback(() => {
    if (opens) onOpen?.(opens);
  }, [onOpen, opens]);

  const content = (
    <>
      <Box row align="center" gap="xs">
        <Icon size={sizes.icon.xs} color={iconColor} />
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {tile.label}
        </Text>
      </Box>
      {hidden ? (
        <Text variant="title" color={colors.text.onBrand}>
          {MASK}
        </Text>
      ) : (
        <AnimatedNumber value={value} variant="title" color={colors.text.onBrand} />
      )}
    </>
  );

  const frame = {
    flex: 1,
    gap: 'xs',
    p: 'md',
    borderRadius: 'lg',
    borderWidth: 'thin',
    borderColor: colors.glass.border,
    bg: colors.glass.fill,
  } as const;

  if (!opens || !onOpen) return <Box {...frame}>{content}</Box>;

  return (
    <Pressable
      {...frame}
      onPress={handlePress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={hidden ? `${tile.label}, ${t('common.money.hidden')}` : `${tile.label}, ${value}`}
    >
      {content}
    </Pressable>
  );
};

export const HeroTile = memo(HeroTileComponent);
