import React, { memo, useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  Blur,
  Canvas,
  Group,
  Image as SkiaImage,
  LinearGradient,
  Mask,
  Rect,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

/** A real banner keeps its shapes; an avatar stand-in is blurred into a colour wash. */
const BLUR = { cover: 6, avatar: 28 } as const;
const OPACITY = { cover: 0.7, avatar: 0.5 } as const;

interface MediaKitCoverProps {
  coverUrl: string | null;
  avatarUrl: string | null;
}

/**
 * Behind the hero: the creator's banner, or their photo blown up and blurred, laid over the
 * navy backdrop and fading out toward the body. Skia, not a native blur view, because the hero
 * moves with parallax (rule 08). Nothing to show → the plain navy backdrop.
 */
const MediaKitCoverComponent: React.FC<MediaKitCoverProps> = ({ coverUrl, avatarUrl }) => {
  const { colors } = useTheme();
  const kind = coverUrl ? 'cover' : 'avatar';
  const image = useImage(coverUrl ?? avatarUrl ?? undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const styles = useStyles(() => ({
    fill: { position: 'absolute' as const, top: 0, bottom: 0, start: 0, end: 0 },
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const { width, height } = size;
  const ready = image !== null && width > 0 && height > 0;

  return (
    <Box style={styles.fill} onLayout={onLayout} pointerEvents="none">
      {ready ? (
        <Canvas style={styles.fill}>
          <Mask
            mask={
              <Rect x={0} y={0} width={width} height={height}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, height)}
                  colors={[colors.text.onBrand, colors.text.onBrand, colors.layout.transparent]}
                  positions={[0, 0.55, 1]}
                />
              </Rect>
            }
          >
            <Group opacity={OPACITY[kind]}>
              <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="cover">
                <Blur blur={BLUR[kind]} mode="clamp" />
              </SkiaImage>
            </Group>
          </Mask>
        </Canvas>
      ) : null}
    </Box>
  );
};

export const MediaKitCover = memo(MediaKitCoverComponent);
