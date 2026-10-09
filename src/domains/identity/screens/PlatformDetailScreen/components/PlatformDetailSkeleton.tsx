import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

/** Reserves the account card, settings and prices while the platform loads. */
const PlatformDetailSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();

  return (
    <Box gap="2xl">
      <Card p="lg">
        <Box gap="lg">
          <Box row align="center" gap="md">
            <Skeleton width={sizes.button.lg} height={sizes.button.lg} borderRadius="md" />
            <Box flex={1} gap="sm">
              <Skeleton width="50%" height={sizes.icon.sm} />
              <Skeleton width="30%" height={sizes.icon.xs} />
            </Box>
          </Box>
          <Skeleton width="40%" height={sizes.icon.xs} />
        </Box>
      </Card>
      <Skeleton width="100%" height={sizes.button.lg * 2} borderRadius="lg" />
      <Skeleton width="100%" height={sizes.button.lg * 3} borderRadius="lg" />
    </Box>
  );
};

export const PlatformDetailSkeleton = memo(PlatformDetailSkeletonComponent);
