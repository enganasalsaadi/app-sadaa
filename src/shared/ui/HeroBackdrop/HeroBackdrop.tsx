import React, { memo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Circle, LinearGradient, RadialGradient, Rect, Skia, vec } from '@shopify/react-native-skia';
import { useTheme } from '@/core/theme';

const GLOW_OPACITY = 0.55;

// Skia interpolates unpremultiplied: fading to `transparent` (black) would muddy the glow.
const clearOf = (color: string) => {
  const c = Skia.Color(color);
  c[3] = 0;
  return c;
};

/**
 * Full-screen navy gradient + two soft teal glows, drawn once by Skia on the GPU
 * (the old SVG radial gradients were rasterised on the CPU at full-screen size).
 * Render as the first child of a flex:1 full-screen container.
 */
const HeroBackdropComponent: React.FC = () => {
  const { colors, isRTL } = useTheme();
  const { width, height } = useWindowDimensions();
  // SVG-style percentage radius: relative to the normalised diagonal.
  const diagonal = Math.sqrt((width * width + height * height) / 2);
  // Primary glow sits on the reading-start side, secondary on the end side.
  const primary = vec(isRTL ? width : 0, height * 0.4);
  const secondary = vec(isRTL ? 0 : width, height * 0.62);
  const primaryR = diagonal * 0.45;
  const secondaryR = diagonal * 0.35;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none" opaque>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(width * 0.2, 0)}
          end={vec(width * 0.8, height)}
          colors={colors.gradients.onboarding}
        />
      </Rect>
      <Circle c={primary} r={primaryR} opacity={GLOW_OPACITY}>
        <RadialGradient
          c={primary}
          r={primaryR}
          colors={[colors.glass.glowPrimary, clearOf(colors.glass.glowPrimary)]}
        />
      </Circle>
      <Circle c={secondary} r={secondaryR} opacity={GLOW_OPACITY}>
        <RadialGradient
          c={secondary}
          r={secondaryR}
          colors={[colors.glass.glowSecondary, clearOf(colors.glass.glowSecondary)]}
        />
      </Circle>
    </Canvas>
  );
};

export const HeroBackdrop = memo(HeroBackdropComponent);
