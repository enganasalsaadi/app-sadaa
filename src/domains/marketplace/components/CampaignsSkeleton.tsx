import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const NODE = moderateScale(28);
const ROWS = ['a', 'b', 'c'] as const;
const STATIONS = ['a', 'b', 'c', 'd', 'e'] as const;

/** First load of the campaigns list: cards with their title, details and station track already holding their space. */
const CampaignsSkeletonComponent: React.FC = () => (
  <Box gap="md">
    {ROWS.map(row => (
      <Card key={row} p="lg">
        <Box gap="md">
          <Skeleton width="60%" height={moderateScale(18)} />
          <Skeleton width="40%" height={moderateScale(14)} />
          <Box row justify="space-between">
            {STATIONS.map(station => (
              <Skeleton key={station} width={NODE} height={NODE} borderRadius="full" />
            ))}
          </Box>
          <Skeleton width="100%" height={moderateScale(32)} borderRadius="md" />
        </Box>
      </Card>
    ))}
  </Box>
);

export const CampaignsSkeleton = memo(CampaignsSkeletonComponent);
