// shared/components/primitives/Image.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import type { ViewStyle, StyleProp, ImageRequireSource } from 'react-native';
import { StyleSheet } from 'react-native';
import type {
  Source,
  Priority,
  OnLoadEvent,
  ImageStyle as FastImageStyle,
} from 'react-native-fast-image';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { Box } from './Box';
import type { Mutable, RadiiToken } from '@/core/theme/types';
import { useTheme } from '@/core/theme';

export type { OnLoadEvent } from 'react-native-fast-image';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GradientLayer {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  opacity?: number;
}

export interface ImageProps {
  // Source
  uri?: string;
  source?: Source | ImageRequireSource;
  defaultSource?: ImageRequireSource;

  // Dimensions
  width?: number | string;
  height?: number | string;
  size?: number;
  aspectRatio?: number;

  // Appearance
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  borderRadius?: RadiiToken;
  borderTopRadius?: RadiiToken;
  borderBottomRadius?: RadiiToken;
  rounded?: boolean;
  circle?: boolean;
  tintColor?: string;

  // Gradient overlay
  gradient?: GradientLayer;
  gradientColors?: string[]; // shorthand: ['transparent', 'black']
  gradientDirection?:
    | 'top-bottom'
    | 'bottom-top'
    | 'left-right'
    | 'right-left'
    | 'diagonal';

  // Performance
  priority?: Priority;
  cache?: 'immutable' | 'web' | 'cacheOnly';

  // States
  showSkeleton?: boolean;

  // Events
  onLoad?: (event: OnLoadEvent) => void;
  onError?: () => void;

  // Styles
  style?: StyleProp<FastImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

// ── Helpers for gradient direction ────────────────────────────────────────────

const getGradientPoints = (direction: string) => {
  switch (direction) {
    case 'top-bottom':
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    case 'bottom-top':
      return { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } };
    case 'left-right':
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
    case 'right-left':
      return { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } };
    case 'diagonal':
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
    default:
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
  }
};

// ── Gradient Component ─────────────────────────────────────────────────────────

const ImageGradient = memo<{
  gradient: GradientLayer;
  style?: StyleProp<ViewStyle>;
}>(({ gradient, style }) => {
  const start = gradient.start || { x: 0, y: 0 };
  const end = gradient.end || { x: 0, y: 1 };

  return (
    <LinearGradient
      colors={gradient.colors}
      start={start}
      end={end}
      locations={gradient.locations}
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    />
  );
});

ImageGradient.displayName = 'ImageGradient';

// ── Skeleton overlay ──────────────────────────────────────────────────────────

const Skeleton = memo<{ style?: StyleProp<ViewStyle> }>(({ style }) => {
  const { colors } = useTheme();
  return (
    <Box
      style={[StyleSheet.absoluteFill, style]}
      bg={colors.surface.elevated}
    />
  );
});
Skeleton.displayName = 'ImageSkeleton';

// ── Main component ────────────────────────────────────────────────────────────

export const Image = memo<ImageProps>(
  ({
    uri,
    source,
    defaultSource,
    width,
    height,
    size,
    aspectRatio,
    resizeMode = 'cover',
    borderRadius: borderRadiusProp,
    borderTopRadius: borderTopRadiusProp,
    borderBottomRadius: borderBottomRadiusProp,
    rounded = false,
    circle = false,
    tintColor,
    priority = 'normal',
    cache = 'immutable',
    showSkeleton = true,
    gradient,
    gradientColors,
    gradientDirection = 'top-bottom',
    onLoad,
    onError,
    style,
    containerStyle,
  }) => {
    const { colors, radii } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // ── Build gradient from shorthand ──
    const finalGradient = useMemo<GradientLayer | undefined>(() => {
      if (gradient) return gradient;
      if (gradientColors && gradientColors.length >= 2) {
        const { start, end } = getGradientPoints(gradientDirection);
        return {
          colors: gradientColors,
          start,
          end,
        };
      }
      return undefined;
    }, [gradient, gradientColors, gradientDirection]);

    // ── Border radius for container (RTL-aware) ──
    const containerRadiusStyle = useMemo<ViewStyle>(() => {
      if (circle) return { borderRadius: radii.full };
      if (rounded) return { borderRadius: radii.md };
      const s: Mutable<ViewStyle> = {};
      if (borderRadiusProp !== undefined)
        s.borderRadius = radii[borderRadiusProp];
      if (borderTopRadiusProp !== undefined) {
        const v = radii[borderTopRadiusProp];
        s.borderTopStartRadius = v;
        s.borderTopEndRadius = v;
      }
      if (borderBottomRadiusProp !== undefined) {
        const v = radii[borderBottomRadiusProp];
        s.borderBottomStartRadius = v;
        s.borderBottomEndRadius = v;
      }
      return s;
    }, [
      circle,
      rounded,
      borderRadiusProp,
      borderTopRadiusProp,
      borderBottomRadiusProp,
      radii,
    ]);

    // ── Border radius for FastImage ──
    const imageRadiusStyle = useMemo<FastImageStyle>(() => {
      if (circle) return { borderRadius: radii.full };
      if (rounded) return { borderRadius: radii.md };
      const s: Mutable<FastImageStyle> = {};
      if (borderRadiusProp !== undefined)
        s.borderRadius = radii[borderRadiusProp];
      if (borderTopRadiusProp !== undefined) {
        const v = radii[borderTopRadiusProp];
        s.borderTopLeftRadius = v;
        s.borderTopRightRadius = v;
      }
      if (borderBottomRadiusProp !== undefined) {
        const v = radii[borderBottomRadiusProp];
        s.borderBottomLeftRadius = v;
        s.borderBottomRightRadius = v;
      }
      return s;
    }, [
      circle,
      rounded,
      borderRadiusProp,
      borderTopRadiusProp,
      borderBottomRadiusProp,
      radii,
    ]);

    // ── Container dimensions ──
    const containerDimStyle = useMemo<ViewStyle>(() => {
      if (size !== undefined) return { width: size, height: size };
      const s: Mutable<ViewStyle> = {};
      if (width !== undefined) s.width = width as ViewStyle['width'];
      if (height !== undefined) s.height = height as ViewStyle['height'];
      if (aspectRatio !== undefined) s.aspectRatio = aspectRatio;
      return s;
    }, [size, width, height, aspectRatio]);

    // ── Image source ──
    const imageSource = useMemo<Source | ImageRequireSource>(() => {
      if (source !== undefined) return source;
      return { uri: uri ?? '', priority, cache };
    }, [source, uri, priority, cache]);

    const hasValidSource =
      typeof imageSource === 'number' || !!(imageSource as Source).uri;

    // ── Handlers ──
    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
      setHasError(false);
    }, []);

    const handleLoad = useCallback(
      (event: OnLoadEvent) => {
        setIsLoading(false);
        onLoad?.(event);
      },
      [onLoad],
    );

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }, [onError]);

    // ── Fallback when no source ──
    if (!hasValidSource) {
      return (
        <Box
          style={[
            CONTAINER_BASE,
            containerDimStyle,
            containerRadiusStyle,
            containerStyle,
          ]}
          bg={colors.surface.elevated}
        />
      );
    }

    // ── Render ──
    return (
      <Box
        style={[
          CONTAINER_BASE,
          containerDimStyle,
          containerRadiusStyle,
          containerStyle,
        ]}
      >
        {/* Main Image */}
        <FastImage
          source={imageSource as Source}
          defaultSource={defaultSource}
          style={[FILL_STYLE, imageRadiusStyle, style]}
          resizeMode={resizeMode}
          tintColor={tintColor}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Error fallback */}
        {hasError && (
          <Box
            style={[StyleSheet.absoluteFill, containerRadiusStyle]}
            bg={colors.surface.elevated}
          />
        )}

        {/* Skeleton loading */}
        {showSkeleton && isLoading && !hasError && (
          <Skeleton style={containerRadiusStyle} />
        )}

        {/* 🔥 Gradient Layer (overlay on top of image) */}
        {finalGradient && (
          <ImageGradient
            gradient={finalGradient}
            style={[
              containerRadiusStyle,
              { opacity: finalGradient.opacity ?? 1 },
            ]}
          />
        )}
      </Box>
    );
  },
);

Image.displayName = 'Image';

// ── Pre-configured variants ───────────────────────────────────────────────────

export const Avatar: React.FC<Omit<ImageProps, 'circle'>> = props => (
  <Image priority="high" size={40} {...props} circle />
);

export const Thumbnail: React.FC<Omit<ImageProps, 'rounded'>> = props => (
  <Image size={60} {...props} rounded />
);

export const Banner: React.FC<Omit<ImageProps, 'aspectRatio'>> = props => (
  <Image width="100%" aspectRatio={16 / 9} {...props} />
);

// ── Module-level constants ────────────────────────────────────────────────────

const CONTAINER_BASE: ViewStyle = { overflow: 'hidden' };

const FILL_STYLE: FastImageStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  start: 0,
  end: 0,
};
