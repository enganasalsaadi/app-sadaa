import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { G, Path, Polygon } from 'react-native-svg';
import { resolveHue, useTheme } from '@/core/theme';
import { FOLLOWER_TIER_STYLE } from '@/core/config';
import type { FollowerTierId } from '@/core/config';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { TierInfoSheet } from './TierInfoSheet';
import { TIER_NAME_KEY } from './tierBadgeI18n';

export type TierBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

const HEX_POINTS = '16,2.5 27.7,9.25 27.7,22.75 16,29.5 4.3,22.75 4.3,9.25';
const CHEVRON_PATH: Record<1 | 2 | 3, string> = {
  1: 'M7 14.5l5-5 5 5',
  2: 'M7 11l5-5 5 5M7 17l5-5 5 5',
  3: 'M7.5 8.5l4.5-4 4.5 4M7.5 13.5l4.5-4 4.5 4M7.5 18.5l4.5-4 4.5 4',
};
const STAR_PATH =
  'M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z';
const CROWN_PATH = 'M4 8l3.5 3.2L12 5l4.5 6.2L20 8l-1.6 9H5.6z';
const CROWN_BASE_PATH = 'M6 19.8h12';

export interface TierCrestIconProps {
  /** 1–5, escalates the glyph: chevron count → star → crown (rule 08, never color-only). */
  level: number;
  size: number;
  fill: string;
  glyph: string;
}

/** The crest icon alone — reused by `TierBadge` and `TierInfoSheet`. */
export const TierCrestIcon: React.FC<TierCrestIconProps> = memo(
  ({ level, size, fill, glyph }) => (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Polygon
        points={HEX_POINTS}
        fill={fill}
        stroke={fill}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <G transform="translate(6.4, 6.6) scale(0.8)">
        {level <= 3 ? (
          <Path
            d={CHEVRON_PATH[level as 1 | 2 | 3]}
            stroke={glyph}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : level === 4 ? (
          <Path d={STAR_PATH} fill={glyph} stroke={glyph} strokeWidth={1.2} strokeLinejoin="round" />
        ) : (
          <>
            <Path d={CROWN_PATH} fill={glyph} stroke={glyph} strokeWidth={1.2} strokeLinejoin="round" />
            <Path d={CROWN_BASE_PATH} stroke={glyph} strokeWidth={2.6} strokeLinecap="round" />
          </>
        )}
      </G>
    </Svg>
  ),
);

const TEXT_VARIANT = {
  xs: 'caption',
  sm: 'caption',
  md: 'bodySmall',
  lg: 'bodyMedium',
} as const;

export interface TierBadgeProps {
  tier: FollowerTierId;
  size?: TierBadgeSize;
  /** Set false when the badge already sits inside another pressable (e.g. a card row). */
  interactive?: boolean;
  accessibilityLabel?: string;
}

/**
 * Follower-tier crest — the only approved way to show a tier anywhere in the
 * app (rule 08). Tapping it opens `TierInfoSheet` explaining every tier.
 */
const TierBadgeComponent: React.FC<TierBadgeProps> = ({
  tier,
  size = 'sm',
  interactive = true,
  accessibilityLabel,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);

  const { tone, level } = FOLLOWER_TIER_STYLE[tier];
  const hue = resolveHue(colors, tone);
  // Mustard is too light for a white glyph (rule 08 contrast rule); every other fill is dark/mid enough.
  const glyph = tone === 'premium' ? colors.brand.main : colors.text.onAccent;
  const label = t(TIER_NAME_KEY[tier]);
  const iconSize = sizes.icon[size];

  const content =
    size === 'xs' ? (
      <TierCrestIcon level={level} size={iconSize} fill={hue.main} glyph={glyph} />
    ) : (
      <Box
        row
        alignSelf="flex-start"
        align="center"
        gap="xs"
        px={size === 'lg' ? 'md' : 'sm'}
        py="xs"
        borderRadius="full"
        bg={hue.soft}
      >
        <TierCrestIcon level={level} size={iconSize} fill={hue.main} glyph={glyph} />
        <Text variant={TEXT_VARIANT[size]} color={hue.text}>
          {label}
        </Text>
      </Box>
    );

  if (!interactive) {
    return (
      <Box accessible accessibilityLabel={accessibilityLabel ?? label} accessibilityRole="image">
        {content}
      </Box>
    );
  }

  return (
    <>
      <Pressable
        onPress={openSheet}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {content}
      </Pressable>
      <TierInfoSheet visible={sheetVisible} onClose={closeSheet} />
    </>
  );
};

export const TierBadge = memo(TierBadgeComponent);
