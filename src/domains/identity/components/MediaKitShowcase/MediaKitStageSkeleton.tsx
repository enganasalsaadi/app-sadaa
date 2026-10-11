import React, { memo, useCallback, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';
import {
  MediaKitStageCanvas,
  STAGE_BOX,
  STAGE_PHOTO as PHOTO,
  STAGE_RING_RADIUS as RING_RADIUS,
  STAGE_RING_WIDTH as RING_WIDTH,
  STAGE_WAVE_HEIGHT,
} from './MediaKitStageCanvas';

const REACH_HEIGHT = moderateScale(58);
const TILE_HEIGHT = moderateScale(44);
const TILE_WIDTH = moderateScale(150);
const TILES = ['a', 'b'] as const;

/**
 * The stage while the kit loads: the same navy scene, still, with glass placeholders where the
 * photo, name, pills and reach land, at the same sizes so nothing jumps.
 */
const MediaKitStageSkeletonComponent: React.FC = () => {
  const { sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(0);
  const padTop = top + sizes.iconButton.md + spacing.lg;
  const styles = useStyles(
    () => ({ stage: { paddingTop: padTop, paddingBottom: STAGE_WAVE_HEIGHT + spacing.lg, overflow: 'hidden' as const } }),
    [padTop],
  );
  const onLayout = useCallback((event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height), []);

  return (
    <Box style={styles.stage} onLayout={onLayout}>
      <MediaKitStageCanvas
        width={width}
        height={height}
        photoX={width / 2}
        photoY={padTop + STAGE_BOX / 2}
        ringRadius={RING_RADIUS}
        ringWidth={RING_WIDTH}
        overCover={false}
        running={false}
      />
      <Box align="center" gap="md" px="xl">
        <Box width={STAGE_BOX} height={STAGE_BOX} align="center" justify="center">
          <Skeleton width={PHOTO} height={PHOTO} borderRadius="full" surface="brand" />
        </Box>
        <Skeleton width="60%" height={sizes.icon.lg} borderRadius="xs" surface="brand" />
        <Skeleton width="40%" height={sizes.icon.sm} borderRadius="xs" surface="brand" />
        <Skeleton width="70%" height={sizes.button.sm} borderRadius="full" surface="brand" />
        <Skeleton width="45%" height={REACH_HEIGHT} borderRadius="sm" surface="brand" />
        <Box row gap="sm">
          {TILES.map(key => (
            <Skeleton key={key} width={TILE_WIDTH} height={TILE_HEIGHT} borderRadius="md" surface="brand" />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export const MediaKitStageSkeleton = memo(MediaKitStageSkeletonComponent);
