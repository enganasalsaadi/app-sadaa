import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

/** About a task card's height: kicker, who, the chips and the button. */
const CARD_HEIGHT = moderateScale(212);

/** Same silhouette as the task deck: the front card. */
const DealsSkeletonComponent: React.FC = () => (
  <Box px="xl" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Skeleton width="100%" height={CARD_HEIGHT} borderRadius="xl" />
  </Box>
);

export const DealsSkeleton = memo(DealsSkeletonComponent);
