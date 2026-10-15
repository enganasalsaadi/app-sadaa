import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const FACE = moderateScale(44);
const BAR = moderateScale(44);
const STEPS = moderateScale(40);
const ROWS = ['a', 'b', 'c'] as const;

/** First load of a deal list: tickets with their identity, status line and stations reserved. */
const DealTicketsSkeletonComponent: React.FC = () => (
  <Box gap="md">
    {ROWS.map(row => (
      <Card key={row} p="lg">
        <Box gap="md">
          <Box row align="center" gap="md">
            <Skeleton width={FACE} height={FACE} borderRadius="full" />
            <Box flex={1} gap="xs">
              <Skeleton width="55%" height={moderateScale(14)} />
              <Skeleton width="80%" height={moderateScale(10)} />
            </Box>
          </Box>
          <Skeleton width="100%" height={BAR} borderRadius="md" />
          <Skeleton width="100%" height={STEPS} borderRadius="sm" />
        </Box>
      </Card>
    ))}
  </Box>
);

export const DealTicketsSkeleton = memo(DealTicketsSkeletonComponent);
