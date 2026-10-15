import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

/** About the loaded card's height: who, the action, the clock and the button. */
const CARD_HEIGHT = moderateScale(240);
const CHIP_WIDTH = moderateScale(120);
const CHIP_HEIGHT = moderateScale(44);

/** Same silhouette as «your turn»: the heading line, the front card, one chip. */
const DealsSkeletonComponent: React.FC = () => {
  const { typography } = useTheme();
  return (
    <Box gap="md" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box px="xl">
        <Skeleton width="40%" height={typography.h4.lineHeight} borderRadius="xs" />
      </Box>
      <Box px="xl">
        <Skeleton width="100%" height={CARD_HEIGHT} borderRadius="xl" />
      </Box>
      <Box px="xl">
        <Skeleton width={CHIP_WIDTH} height={CHIP_HEIGHT} borderRadius="full" />
      </Box>
    </Box>
  );
};

export const DealsSkeleton = memo(DealsSkeletonComponent);
