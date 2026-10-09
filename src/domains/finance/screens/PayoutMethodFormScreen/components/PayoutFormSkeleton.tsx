import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const FIELDS = 3;

/** Channel card + labelled inputs while the saved methods load. */
const PayoutFormSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();

  return (
    <Box gap="3xl" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton width="100%" height={sizes.button.lg + sizes.iconButton.sm} borderRadius="lg" />
      <Box gap="lg">
        {Array.from({ length: FIELDS }, (_, index) => (
          <Box key={index} gap="sm">
            <Skeleton width="30%" height={sizes.icon.xs} />
            <Skeleton width="100%" height={sizes.input.lg} borderRadius="md" />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const PayoutFormSkeleton = memo(PayoutFormSkeletonComponent);
