import React, { memo } from 'react';
import { Box, Card, Skeleton } from '@/shared/ui';

const ROWS = [0, 1, 2];

/** Three application cards' worth of room while the tab loads, so nothing jumps when they land. */
const ApplicationsSkeletonComponent: React.FC = () => (
  <Box gap="lg" px="xl" pt="sm">
    {ROWS.map(row => (
      <Card key={row} p="lg">
        <Box gap="md">
          <Box row gap="md">
            <Skeleton width={60} height={60} borderRadius="lg" />
            <Box flex={1} gap="sm">
              <Skeleton width="80%" height={16} />
              <Skeleton width="40%" height={12} />
              <Skeleton width={96} height={22} borderRadius="full" />
            </Box>
          </Box>
          <Skeleton width={120} height={32} />
        </Box>
      </Card>
    ))}
  </Box>
);

export const ApplicationsSkeleton = memo(ApplicationsSkeletonComponent);
