import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const ROWS = ['a', 'b'] as const;

/** Reserves the identity card + one list section while the kit loads. */
const MediaKitPreviewSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();

  return (
    <Box gap="2xl">
      <Card shadow="none" p="lg">
        <Box gap="md">
          <Box row align="center" gap="md">
            <Skeleton width={sizes.avatar.lg} height={sizes.avatar.lg} borderRadius="full" />
            <Box flex={1} gap="sm">
              <Skeleton width="60%" height={sizes.icon.md} borderRadius="sm" />
              <Skeleton width="40%" height={sizes.icon.sm} borderRadius="sm" />
            </Box>
          </Box>
          <Skeleton width="70%" height={sizes.icon.md} borderRadius="sm" />
        </Box>
      </Card>
      <Card shadow="none" p="lg">
        <Box gap="lg">
          {ROWS.map(key => (
            <Skeleton key={key} width="100%" height={sizes.icon.lg} borderRadius="sm" />
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export const MediaKitPreviewSkeleton = memo(MediaKitPreviewSkeletonComponent);
