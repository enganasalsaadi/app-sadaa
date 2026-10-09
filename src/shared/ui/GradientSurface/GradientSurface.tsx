import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, type ThemeColors } from '@/core/theme';
import { Box, type BoxProps } from '../primitives/Box';

/**
 * `brand`: navy hero gradient (identity surfaces) · `live`: the darker dashboard hero gradient
 * that sits under `GlowOrbs` (rule 08 v4) · `premium`: soft mustard wash (verified, top creators).
 */
export type GradientSurfaceVariant = 'brand' | 'live' | 'premium';

export interface GradientSurfaceProps extends BoxProps {
  variant: GradientSurfaceVariant;
}

const GRADIENT = {
  brand: gradients => gradients.hero,
  live: gradients => gradients.heroLive,
  premium: gradients => gradients.premium,
} as const satisfies Record<GradientSurfaceVariant, (gradients: ThemeColors['gradients']) => string[]>;

const DIRECTION = {
  brand: { start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  live: { start: { x: 0.35, y: 0 }, end: { x: 0.65, y: 1 } },
  premium: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const satisfies Record<GradientSurfaceVariant, object>;

/**
 * A Box painted with a theme gradient. `premium` is a highlight card (radius `lg`,
 * mustard 1px border); mustard stays fill/border only, so put text-coloured content on it.
 */
const GradientSurfaceComponent: React.FC<GradientSurfaceProps> = ({
  variant,
  children,
  ...boxProps
}) => {
  const { colors } = useTheme();
  const premium = variant === 'premium';

  return (
    <Box
      overflow="hidden"
      borderRadius={premium ? 'lg' : undefined}
      borderWidth={premium ? 'thin' : undefined}
      borderColor={premium ? colors.premium.main : undefined}
      {...boxProps}
    >
      <LinearGradient
        colors={GRADIENT[variant](colors.gradients)}
        start={DIRECTION[variant].start}
        end={DIRECTION[variant].end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Box>
  );
};

export const GradientSurface = memo(GradientSurfaceComponent);
