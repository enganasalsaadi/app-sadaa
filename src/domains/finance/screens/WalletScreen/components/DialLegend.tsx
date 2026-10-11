import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Skeleton, Text } from '@/shared/ui';
import type { WalletDialSegment } from '../hooks/useWalletHero';

const SKELETON_TILES = [0, 1, 2] as const;

interface LegendTileProps {
  segment: WalletDialSegment;
  selected: boolean;
  hidden: boolean;
  onSelect: (key: string) => void;
}

const LegendTile = memo<LegendTileProps>(({ segment, selected, hidden, onSelect }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { key } = segment;
  const press = useCallback(() => onSelect(key), [key, onSelect]);
  const dot =
    segment.kind === 'waiting'
      ? { color: colors.text.onBrandMuted, opacity: 1 }
      : { color: colors.glass.iconMoney, opacity: segment.kind === 'escrow' ? colors.wallet.dialEscrowOpacity : 1 };
  const amount = hidden
    ? t('common.money.hidden')
    : formatMoney(segment.value, i18n.language, { notation: 'compact', rounding: 'down' });

  return (
    <Pressable
      flex={1}
      gap="xs"
      px="md"
      py="sm"
      minHeight={sizes.button.xl}
      justify="center"
      borderRadius="lg"
      borderWidth="thin"
      borderColor={selected ? colors.glass.border : colors.layout.transparent}
      bg={selected ? colors.wallet.legendActive : colors.glass.fill}
      onPress={press}
      scaleOnPress
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${segment.label}, ${amount}`}
    >
      <Box row align="center" gap="xs">
        <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={dot.color} opacity={dot.opacity} />
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {segment.label}
        </Text>
      </Box>
      <MoneyText value={segment.value} tone="onBrand" notation="compact" rounding="down" hidden={hidden} />
    </Pressable>
  );
});

export interface DialLegendProps {
  segments: readonly WalletDialSegment[];
  selectedKey: string;
  hidden: boolean;
  loading: boolean;
  onSelect: (key: string) => void;
}

/** One glass tile per arc: a dot in the arc's color, its name and its figure; tapping picks the arc. */
const DialLegendComponent: React.FC<DialLegendProps> = ({ segments, selectedKey, hidden, loading, onSelect }) => {
  const { sizes } = useTheme();

  if (loading) {
    return (
      <Box row gap="sm">
        {SKELETON_TILES.map(tile => (
          <Box key={tile} flex={1}>
            <Skeleton width="100%" height={sizes.button.xl} borderRadius="lg" surface="brand" />
          </Box>
        ))}
      </Box>
    );
  }
  // A lone available balance has nothing to compare: the dial says it all.
  if (segments.length < 2) return null;

  return (
    <Box row gap="sm">
      {segments.map(segment => (
        <LegendTile
          key={segment.key}
          segment={segment}
          selected={segment.key === selectedKey}
          hidden={hidden}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
};

export const DialLegend = memo(DialLegendComponent);
