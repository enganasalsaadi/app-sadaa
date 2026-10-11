import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const TILE_HEIGHT = moderateScale(150);
const TICKET_HEIGHT = moderateScale(132);
const TILES = ['a', 'b'] as const;
const TICKETS = ['a', 'b'] as const;

/** Body placeholder where the sections land: a section title, a pair of tiles, two tickets. */
const MediaKitShowcaseBodySkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();
  return (
    <Box px="xl" pt="sm" gap="4xl">
      <Box gap="lg">
        <Box gap="xs">
          <Skeleton width="20%" height={sizes.icon.xs} borderRadius="xs" />
          <Skeleton width="60%" height={sizes.icon.lg} borderRadius="xs" />
        </Box>
        <Box row gap="md">
          {TILES.map(key => (
            <Box key={key} flex={1}>
              <Skeleton width="100%" height={TILE_HEIGHT} borderRadius="xl" />
            </Box>
          ))}
        </Box>
      </Box>
      <Box gap="md">
        {TICKETS.map(key => (
          <Skeleton key={key} width="100%" height={TICKET_HEIGHT} borderRadius="xl" />
        ))}
      </Box>
    </Box>
  );
};

export const MediaKitShowcaseBodySkeleton = memo(MediaKitShowcaseBodySkeletonComponent);
