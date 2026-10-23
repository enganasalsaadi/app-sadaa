import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { FileText, Play } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, motion, useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, Image, Pressable, Text } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';
import type { VaultDeckPreview } from '../hooks/useFileVaultScreen';

/** Card share of the fan's width, and its portrait ratio. */
const CARD_SHARE = 0.62;
const CARD_RATIO = 1.3;
/** Resting tilt of the outer cards, and how far a press fans them (degrees / card widths). */
const TILT = 9;
const SPREAD_TILT = 16;
const SPREAD_SHIFT = 0.28;

export interface VaultDeckSection {
  key: string;
  bytes: number;
}

export interface VaultDeckProps {
  kicker: string;
  count: number;
  bytes: number;
  previews: readonly VaultDeckPreview[];
  sections: readonly VaultDeckSection[];
}

interface FanCardProps {
  preview: VaultDeckPreview;
  /** -1 / 0 / 1: left, middle, right of the fan. */
  slot: number;
  spread: SharedValue<number>;
}

const FanCard = memo<FanCardProps>(({ preview, slot, spread }) => {
  const { colors, sizes } = useTheme();
  const width = sizes.vault.deck * CARD_SHARE;
  const styles = useStyles(
    ({ radii, borderWidths, shadows }): Record<'card', ViewStyle> => ({
      card: {
        position: 'absolute',
        width,
        height: width * CARD_RATIO,
        borderRadius: radii.sm,
        borderWidth: borderWidths.sm,
        borderColor: colors.text.onBrand,
        overflow: 'hidden',
        backgroundColor: preview.uri ? colors.viewer.backdrop : colors.viewer.paper,
        ...shadows.md,
      },
    }),
    [colors.text.onBrand, colors.viewer.backdrop, colors.viewer.paper, preview.uri, width],
  );
  const motionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: slot * width * SPREAD_SHIFT * spread.value },
      { rotate: `${slot * interpolate(spread.value, [0, 1], [TILT, SPREAD_TILT])}deg` },
    ],
  }));
  const Icon = preview.kind === 'video' ? Play : FileText;

  return (
    <Animated.View style={[styles.card, motionStyle]}>
      {preview.uri ? (
        <Image uri={preview.uri} width="100%" height="100%" resizeMode="cover" />
      ) : (
        <Box flex={1} align="center" justify="center">
          <Icon
            size={sizes.icon.md}
            color={preview.kind === 'video' ? colors.viewer.text : colors.viewer.paperLine}
            strokeWidth={iconStroke.regular}
          />
        </Box>
      )}
    </Animated.View>
  );
});
FanCard.displayName = 'FanCard';

/**
 * The vault's navy deck: the latest files fanned like prints on a desk (a press spreads them), the
 * count and weight of everything here, and a meter of how much each section weighs.
 */
const VaultDeckComponent: React.FC<VaultDeckProps> = ({ kicker, count, bytes, previews, sections }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const spread = useSharedValue(0);

  const to = useCallback(
    (value: number) => {
      spread.value = reduceMotion ? value : withSpring(value, motion.spring);
    },
    [reduceMotion, spread],
  );
  const open = useCallback(() => to(1), [to]);
  const rest = useCallback(() => to(0), [to]);

  const styles = useStyles(
    ({ spacing }): Record<'fan' | 'meter', ViewStyle> => ({
      fan: { width: sizes.vault.deck, height: sizes.vault.deckHeight, alignItems: 'center', justifyContent: 'center' },
      meter: { height: sizes.vault.meter, gap: spacing.xs / 2 },
    }),
    [sizes.vault.deck, sizes.vault.deckHeight, sizes.vault.meter],
  );

  const weighed = sections.filter(entry => entry.bytes > 0);
  const slots = previews.length === 1 ? [0] : previews.length === 2 ? [-1, 1] : [-1, 0, 1];
  const label = `${kicker}: ${t('marketplace.vault.files', { count })} · ${formatFileSize(bytes)}`;

  return (
    <Box pt="sm">
      <GradientSurface variant="brand" borderRadius="xl" p="lg" gap="lg">
        <Pressable onPressIn={open} onPressOut={rest} row align="center" gap="lg" accessible accessibilityLabel={label}>
          {previews.length > 0 ? (
            <Box style={styles.fan}>
              {previews.map((preview, index) => (
                <FanCard key={preview.id} preview={preview} slot={slots[index] ?? 0} spread={spread} />
              ))}
            </Box>
          ) : null}
          <Box flex={1} gap="xs">
            <Text variant="caption" color={colors.text.onBrandMuted}>
              {kicker}
            </Text>
            <Text variant="amountLarge" color={colors.text.onBrand}>
              {formatNumber(count)}
            </Text>
            <Text variant="bodySmall" color={colors.text.onBrandMuted}>
              {`${t('marketplace.vault.files', { count })} · ${formatFileSize(bytes)}`}
            </Text>
          </Box>
        </Pressable>
        {weighed.length > 1 ? (
          <Box row style={styles.meter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {weighed.map((entry, index) => (
              <Box
                key={entry.key}
                flex={entry.bytes}
                borderRadius="full"
                bg={colors.vault.meter[index % colors.vault.meter.length]}
              />
            ))}
          </Box>
        ) : null}
      </GradientSurface>
    </Box>
  );
};

export const VaultDeck = memo(VaultDeckComponent);
