import React, { memo } from 'react';
import { Box, GradientSurface, Skeleton } from '@/shared/ui';
import { useTheme } from '@/core/theme';

/** A list-row placeholder: avatar + two text lines, then a media block; `brand` on a navy hero. */
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
      <GradientSurface variant="brand" p="lg" gap="sm" borderRadius="lg">
        <Skeleton width="50%" height={typography.h3.lineHeight} surface="brand" />
        <Skeleton width="30%" height={typography.caption.lineHeight} surface="brand" />
      </GradientSurface>
    </Box>
  );
};

export const SkeletonDemo = memo(SkeletonDemoComponent);
