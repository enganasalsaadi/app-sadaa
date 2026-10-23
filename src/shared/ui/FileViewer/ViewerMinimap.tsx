import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Image } from '../primitives/Image';
import { ZOOM_EPSILON, clamp, type Size } from './viewerGeometry';

export interface ViewerMinimapProps {
  uri: string;
  natural: Size;
  stage: Size;
  /** The photo's fitted box on the stage. */
  content: SharedValue<Size>;
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  /** 1 while the user handles the photo and for a moment after. */
  awake: SharedValue<number>;
}

/** Tall photos stop growing the map past this share of its width. */
const MAX_ASPECT = 1.5;

/**
 * Where the zoomed view sits on the whole photo: a small copy with the visible window outlined.
 * Shows only while zoomed and handled; fades a second after the fingers lift.
 */
const ViewerMinimapComponent: React.FC<ViewerMinimapProps> = ({
  uri,
  natural,
  stage,
  content,
  scale,
  tx,
  ty,
  awake,
}) => {
  const { sizes } = useTheme();
  const width = sizes.viewer.minimap;
  const height = width * clamp(natural.height / natural.width, 1 / MAX_ASPECT, MAX_ASPECT);

  const styles = useStyles(
    ({ colors, radii, borderWidths }): Record<'frame' | 'window', ViewStyle> => ({
      frame: {
        width,
        height,
        borderRadius: radii.sm,
        overflow: 'hidden',
        borderWidth: borderWidths.thin,
        borderColor: colors.viewer.glassBorder,
        backgroundColor: colors.viewer.glass,
        alignItems: 'center',
        justifyContent: 'center',
      },
      window: {
        position: 'absolute',
        borderWidth: borderWidths.md,
        borderColor: colors.viewer.accent,
        borderRadius: radii.xs,
      },
    }),
    [width, height],
  );

  const shown = useAnimatedStyle(() => ({
    opacity: withTiming(awake.value > 0 && scale.value > ZOOM_EPSILON ? 1 : 0, {
      duration: motion.duration.base,
    }),
  }));

  const frame = useAnimatedStyle(() => {
    const box = content.value;
    const zoomed = Math.max(scale.value, 1);
    // Share of the photo the stage shows, and how far its middle sits from the photo's middle.
    const fx = Math.min(1, stage.width / (box.width * zoomed));
    const fy = Math.min(1, stage.height / (box.height * zoomed));
    const ox = box.width > 0 ? -tx.value / (box.width * zoomed) : 0;
    const oy = box.height > 0 ? -ty.value / (box.height * zoomed) : 0;
    return {
      width: fx * width,
      height: fy * height,
      transform: [{ translateX: ox * width }, { translateY: oy * height }],
    };
  });

  return (
    <Animated.View style={shown} pointerEvents="none">
      <Box style={styles.frame}>
        <Image uri={uri} width={width} height={height} resizeMode="cover" showSkeleton={false} />
        <Box style={StyleSheet.absoluteFill} align="center" justify="center">
          <Animated.View style={[styles.window, frame]} />
        </Box>
      </Box>
    </Animated.View>
  );
};

export const ViewerMinimap = memo(ViewerMinimapComponent);
