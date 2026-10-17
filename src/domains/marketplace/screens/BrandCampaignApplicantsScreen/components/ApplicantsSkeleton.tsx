import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const PHOTO = moderateScale(112);
const ROWS = ['a', 'b', 'c'] as const;

/** First load of the table: cards with their photo, name and price already holding their space. */
const ApplicantsSkeletonComponent: React.FC = () => (
  <Box gap="lg">
    {ROWS.map(row => (
      <Card key={row} p="md">
        <Box row gap="md">
          <Skeleton width={PHOTO} height={PHOTO} borderRadius="md" />
          <Box flex={1} gap="sm">
            <Skeleton width="60%" height={moderateScale(16)} />
            <Skeleton width="40%" height={moderateScale(12)} />
            <Skeleton width="75%" height={moderateScale(12)} />
            <Skeleton width="30%" height={moderateScale(18)} />
          </Box>
        </Box>
      </Card>
    ))}
  </Box>
);

export const ApplicantsSkeleton = memo(ApplicantsSkeletonComponent);
