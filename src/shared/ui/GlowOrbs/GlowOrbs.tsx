import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Canvas, Circle, RadialGradient, Skia, vec } from '@shopify/react-native-skia';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

// Barely there: a hint of light on the navy, never a shape the eye stops on.
const WASH_OPACITY = { light: 0.1, tint: 0.14 } as const;

/**
 * Fractions of the surface: `x` from the reading-start edge, `y` from the top,
 * `r` of the width so the washes keep their share of the band on any height.
 */
const WASHES = {
  end: { x: 1, y: 0, r: 0.38 },
  start: { x: 0, y: 1, r: 0.6 },
} as const;

// Skia interpolates unpremultiplied: fading to `transparent` (black) would muddy the glow.
const clearOf = (color: string) => {
  const c = Skia.Color(color);
  c[3] = 0;
  return c;
};

/**
 * Decoration for navy surfaces (the Layout `brandGlow` hero backdrop): two soft
 * radial light washes in opposite corners, white at the top end, pale teal at the
 * bottom start, no outlines. Fills its parent, draws nothing until measured,
 * never takes touches. Belongs over navy only (rule 08).
 */
const GlowOrbsComponent: React.FC = () => {
  const { colors, isRTL } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const { width, height } = size;
  const at = (x: number, y: number) => vec(width * (isRTL ? 1 - x : x), height * y);
  const end = at(WASHES.end.x, WASHES.end.y);
  const start = at(WASHES.start.x, WASHES.start.y);
  const light = colors.text.onBrand;
  const tint = colors.glass.glowSecondary;

  return (
    <Box style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {width > 0 && height > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Circle c={end} r={width * WASHES.end.r} opacity={WASH_OPACITY.light}>
            <RadialGradient c={end} r={width * WASHES.end.r} colors={[light, clearOf(light)]} />
          </Circle>
          <Circle c={start} r={width * WASHES.start.r} opacity={WASH_OPACITY.tint}>
            <RadialGradient c={start} r={width * WASHES.start.r} colors={[tint, clearOf(tint)]} />
          </Circle>
        </Canvas>
      ) : null}
    </Box>
  );
};

export const GlowOrbs = memo(GlowOrbsComponent);
