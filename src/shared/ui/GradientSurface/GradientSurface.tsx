import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@/core/theme';
import { Box, type BoxProps } from '../primitives/Box';

/** `brand`: navy hero gradient (identity surfaces) · `premium`: soft mustard wash (verified, top creators). */
export type GradientSurfaceVariant = 'brand' | 'premium';

export interface GradientSurfaceProps extends BoxProps {
  variant: GradientSurfaceVariant;
}

const DIRECTION = {
  brand: { start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
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
        colors={premium ? colors.gradients.premium : colors.gradients.hero}
        start={DIRECTION[variant].start}
        end={DIRECTION[variant].end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Box>
  );
};

export const GradientSurface = memo(GradientSurfaceComponent);
