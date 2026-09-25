import React, { memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { BlurMask, Group, RoundedRect, rect, rrect } from '@shopify/react-native-skia';
import { useTheme } from '@/core/theme';

/** Theme values for `GlassCard`, resolved outside the canvas. */
export interface GlassCardStyle {
  fill: string;
  border: string;
  radius: number;
  stroke: number;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowOffsetY: number;
}

/**
 * Skia's reconciler is a separate React root: context (theme) does not reach
 * nodes inside `<Canvas>`. Call this outside the canvas and pass it down.
 */
export const useGlassCardStyle = (): GlassCardStyle => {
  const { colors, radii, shadows, borderWidths } = useTheme();
  return useMemo(() => {
    const { shadowColor, shadowOpacity, shadowRadius, shadowOffset } = shadows.md;
    return {
      fill: colors.glass.fill,
      border: colors.glass.border,
      radius: radii.lg,
      stroke: borderWidths.thin,
      shadowColor: typeof shadowColor === 'string' ? shadowColor : colors.layout.transparent,
      shadowOpacity: typeof shadowOpacity === 'number' ? shadowOpacity : 0,
      shadowBlur: shadowRadius ?? 0,
      shadowOffsetY: shadowOffset?.height ?? 0,
    };
  }, [colors, radii, shadows, borderWidths]);
};

export interface GlassCardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  /** From `useGlassCardStyle()`. */
  glass: GlassCardStyle;
  /** Skia nodes drawn on top of the glass (badge, paragraphs). */
  children?: ReactNode;
}

/**
 * Glass surface as Skia nodes. Must be rendered inside a Skia `<Canvas>`,
 * and only over the navy gradient (`HeroBackdrop`); on neutral backgrounds use `Card` (rule 08).
 */
const GlassCardComponent: React.FC<GlassCardProps> = ({ x, y, width, height, glass, children }) => {
  const { radius, stroke } = glass;

  // The fill is translucent: without this clip the shadow shows through the card body.
  const outside = useMemo(() => rrect(rect(x, y, width, height), radius, radius), [x, y, width, height, radius]);

  return (
    <Group>
      <Group clip={outside} invertClip>
        <RoundedRect
          x={x}
          y={y + glass.shadowOffsetY}
          width={width}
          height={height}
          r={radius}
          color={glass.shadowColor}
          opacity={glass.shadowOpacity}
        >
          <BlurMask blur={glass.shadowBlur} style="normal" />
        </RoundedRect>
      </Group>
      <RoundedRect x={x} y={y} width={width} height={height} r={radius} color={glass.fill} />
      <RoundedRect
        x={x + stroke / 2}
        y={y + stroke / 2}
        width={width - stroke}
        height={height - stroke}
        r={radius - stroke / 2}
        style="stroke"
        strokeWidth={stroke}
        color={glass.border}
      />
      {children}
    </Group>
  );
};

export const GlassCard = memo(GlassCardComponent);
