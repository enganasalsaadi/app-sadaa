import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Divider, Skeleton } from '@/shared/ui';

const TITLE_HEIGHT = moderateScale(14);
const META_HEIGHT = moderateScale(10);

export interface PayoutMethodsSkeletonProps {
  rows: number;
}

/** A card of method rows while the list loads (same height as the real rows). */
const PayoutMethodsSkeletonComponent: React.FC<PayoutMethodsSkeletonProps> = ({ rows }) => {
  const { sizes } = useTheme();

  return (
    <Box accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Card px="lg" py="xs">
      {Array.from({ length: rows }, (_, index) => (
        <Box key={index}>
          {index > 0 ? <Divider /> : null}
          <Box row align="center" gap="md" py="md" minHeight={sizes.button.lg}>
            <Skeleton width={sizes.iconButton.sm} height={sizes.iconButton.sm} borderRadius="md" />
            <Box flex={1} gap="sm">
              <Skeleton width="50%" height={TITLE_HEIGHT} borderRadius="xs" />
              <Skeleton width="70%" height={META_HEIGHT} borderRadius="xs" />
            </Box>
          </Box>
        </Box>
      ))}
      </Card>
    </Box>
  );
};

export const PayoutMethodsSkeleton = memo(PayoutMethodsSkeletonComponent);
