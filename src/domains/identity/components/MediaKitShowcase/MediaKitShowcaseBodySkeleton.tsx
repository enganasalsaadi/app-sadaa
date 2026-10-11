import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const RAIL_CARD = { width: moderateScale(152), height: moderateScale(124) } as const;
const SERVICE_HEIGHT = moderateScale(168);
const RAIL = ['a', 'b', 'c'] as const;
const SERVICES = ['a', 'b'] as const;

/** Body placeholder: a platforms rail and two service cards. */
const MediaKitShowcaseBodySkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();
  return (
    <Box pt="2xl" gap="2xl">
      <Box gap="md">
        <Box px="xl">
          <Skeleton width="35%" height={sizes.icon.md} borderRadius="xs" />
        </Box>
        <Box row px="xl" gap="md">
          {RAIL.map(key => (
            <Skeleton key={key} width={RAIL_CARD.width} height={RAIL_CARD.height} borderRadius="lg" />
          ))}
        </Box>
      </Box>
      <Box px="xl" gap="md">
        <Skeleton width="45%" height={sizes.icon.md} borderRadius="xs" />
        {SERVICES.map(key => (
          <Skeleton key={key} width="100%" height={SERVICE_HEIGHT} borderRadius="lg" />
        ))}
      </Box>
    </Box>
  );
};

export const MediaKitShowcaseBodySkeleton = memo(MediaKitShowcaseBodySkeletonComponent);
