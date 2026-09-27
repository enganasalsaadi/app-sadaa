import React from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import { Skeleton } from '../../../Skeleton';

interface SkeletonItemProps {
  /** 'list' renders a tall card; 'grid' renders a compact square card */
  variant?: 'list' | 'grid';
}

// Text bones are sized to the glyph height (fontSize) of the text they stand in for.
export const SkeletonItem: React.FC<SkeletonItemProps> = ({ variant = 'list' }) => {
  const { colors, typography, sizes } = useTheme();

  if (variant === 'grid') {
    return (
      <Box flex={1} m="xs" borderRadius="lg" overflow="hidden" bg={colors.surface.main} shadow="sm">
        <Skeleton width="100%" height={sizes.thumbnail.lg} borderRadius="none" />
        <Box p="sm" gap="xs">
          <Skeleton width="80%" height={typography.bodySmall.fontSize} borderRadius="sm" />
          <Skeleton width="55%" height={typography.caption.fontSize} borderRadius="sm" />
          <Box mt="xs">
            <Skeleton width="40%" height={typography.body.fontSize} borderRadius="sm" />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box mb="md" borderRadius="lg" overflow="hidden" bg={colors.surface.main} shadow="sm">
      <Skeleton width="100%" height={sizes.illustration.lg} borderRadius="none" />
      <Box p="lg" gap="sm">
        <Skeleton width="70%" height={typography.title.fontSize} borderRadius="sm" />
        <Skeleton width="45%" height={typography.bodySmall.fontSize} borderRadius="sm" />
        <Skeleton width="60%" height={typography.caption.fontSize} borderRadius="sm" />
        <Box row justify="space-between" pt="sm">
          <Box width="28%">
            <Skeleton width="100%" height={sizes.icon.md} borderRadius="sm" />
          </Box>
          <Box width="28%">
            <Skeleton width="100%" height={sizes.icon.md} borderRadius="sm" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
