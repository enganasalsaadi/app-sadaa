import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const COVER = moderateScale(132);
const PIP = moderateScale(22);
const ROWS = ['a', 'b', 'c'] as const;

/** First load of the campaigns list: cards with their cover, seats and price already holding their space. */
const CampaignsSkeletonComponent: React.FC = () => (
  <Box gap="lg">
    {ROWS.map(row => (
      <Card key={row} p="md">
        <Box gap="md">
          <Skeleton width="100%" height={COVER} borderRadius="md" />
          <Box row gap="xs">
            {ROWS.map(pip => (
              <Skeleton key={pip} width={PIP} height={PIP} borderRadius="full" />
            ))}
          </Box>
          <Skeleton width="45%" height={moderateScale(14)} />
        </Box>
      </Card>
    ))}
  </Box>
);

export const CampaignsSkeleton = memo(CampaignsSkeletonComponent);
