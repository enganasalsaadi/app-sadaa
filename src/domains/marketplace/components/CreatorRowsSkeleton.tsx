import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

/** Placeholder ≈ a loaded row card (avatar line, signals, price). */
const ROW_SKELETON_HEIGHT = moderateScale(132);
const SKELETON_ROWS = ['a', 'b', 'c', 'd'] as const;

/** First load of a creator row list (Explore, Shortlist). */
const CreatorRowsSkeletonComponent: React.FC = () => (
  <Box gap="md">
    {SKELETON_ROWS.map(row => (
      <Skeleton key={row} width="100%" height={ROW_SKELETON_HEIGHT} borderRadius="lg" />
    ))}
  </Box>
);

export const CreatorRowsSkeleton = memo(CreatorRowsSkeletonComponent);
