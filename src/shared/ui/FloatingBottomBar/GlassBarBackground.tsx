import React, { memo, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BlurView, type BlurViewProps } from '@react-native-community/blur';
import {
  BlurMask,
  Canvas,
  Group,
  LinearGradient,
  RoundedRect,
  rect,
  rrect,
  vec,
} from '@shopify/react-native-skia';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../primitives';

interface GlassBarBackgroundProps {
  width: number;
  height: number;
  corner: number;
}

type BlurMaterial = 'light' | 'dark';

const BLUR_TYPE: Record<
  BlurMaterial,
  NonNullable<BlurViewProps['blurType']>
> = { light: 'thinMaterialLight', dark: 'thinMaterialDark' };

/** Android's BlurView ignores the rounded clip and paints a grey rectangle; the tint alone carries it there. */
const USE_NATIVE_BLUR = Platform.OS === 'ios';

const SHADOW_BLUR = moderateScale(12);
const SHADOW_OFFSET_Y = moderateScale(4);
/** Room around the capsule for the blurred shadow to fade out. */
const SHADOW_PAD = SHADOW_BLUR * 2 + SHADOW_OFFSET_Y;

/**
 * Navy liquid-glass capsule: native blur of whatever scrolls behind (iOS), a
 * navy tint for label contrast, then a Skia specular rim (bright top, faint bottom)
 * and a soft top sheen so it reads as a lens rather than a flat frosted card.
 */
const GlassBarBackgroundComponent: React.FC<GlassBarBackgroundProps> = ({
  width,
  height,
  corner,
}) => {
  const { colors, borderWidths } = useTheme();
  const { tabBar } = colors.navigation;
  const stroke = borderWidths.thin;
  const half = stroke / 2;
  // Skia shadow instead of the view `shadow` prop: Android drops elevation on a
  // view with no background.
  const outside = useMemo(
    () => rrect(rect(SHADOW_PAD, SHADOW_PAD, width, height), corner, corner),
    [width, height, corner],
  );

  return (
    <>
      <Canvas
        pointerEvents="none"
        style={[
          styles.shadowCanvas,
          {
            top: -SHADOW_PAD,
            start: -SHADOW_PAD,
            width: width + SHADOW_PAD * 2,
            height: height + SHADOW_PAD * 2,
          },
        ]}
      >
        <Group clip={outside} invertClip>
          <RoundedRect
            x={SHADOW_PAD}
            y={SHADOW_PAD + SHADOW_OFFSET_Y}
            width={width}
            height={height}
            r={corner}
            color={tabBar.glassShadow}
          >
            <BlurMask blur={SHADOW_BLUR} style="normal" />
          </RoundedRect>
        </Group>
      </Canvas>
      <Box
        overflow="hidden"
        style={[StyleSheet.absoluteFill, { borderRadius: corner }]}
      >
        {USE_NATIVE_BLUR && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={BLUR_TYPE[tabBar.blurMaterial]}
            blurAmount={20}
            overlayColor={colors.layout.transparent}
            reducedTransparencyFallbackColor={tabBar.glassFallback}
          />
        )}
        <Box style={StyleSheet.absoluteFill} bg={tabBar.glassTint} />
      </Box>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Group opacity={0.4}>
          <RoundedRect x={0} y={0} width={width} height={height} r={corner}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height / 2)}
              colors={[tabBar.glassRim, colors.layout.transparent]}
            />
          </RoundedRect>
        </Group>
        <RoundedRect
          x={half}
          y={half}
          width={width - stroke}
          height={height - stroke}
          r={corner - half}
          style="stroke"
          strokeWidth={stroke}
          color={tabBar.glassBorder}
        />
        <RoundedRect
          x={stroke + half}
          y={stroke + half}
          width={width - stroke * 3}
          height={height - stroke * 3}
          r={corner - stroke - half}
          style="stroke"
          strokeWidth={stroke}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[tabBar.glassRim, tabBar.glassRimFaint]}
          />
        </RoundedRect>
      </Canvas>
    </>
  );
};

export const GlassBarBackground = memo(GlassBarBackgroundComponent);

const styles = StyleSheet.create({
  shadowCanvas: { position: 'absolute' },
});
