import React, { memo } from 'react';
import { Box, Skeleton } from '@/shared/ui';
import { useTheme } from '@/core/theme';

/** A list-row placeholder: avatar + two text lines, then a media block. */
const SkeletonDemoComponent: React.FC = () => {
  const { sizes, typography } = useTheme();

  return (
    <Box gap="lg">
      <Box row align="center" gap="md">
        <Skeleton
          width={sizes.avatar.md}
          height={sizes.avatar.md}
          borderRadius="full"
        />
        <Box flex={1} gap="sm">
          <Skeleton width="60%" height={typography.body.lineHeight} />
          <Skeleton width="40%" height={typography.caption.lineHeight} />
        </Box>
      </Box>
      <Skeleton width="100%" height={sizes.illustration.md} borderRadius="lg" />
    </Box>
  );
};

export const SkeletonDemo = memo(SkeletonDemoComponent);
