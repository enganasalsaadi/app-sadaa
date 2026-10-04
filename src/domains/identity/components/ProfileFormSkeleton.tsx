import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

interface ProfileFormSkeletonProps {
  /** Input rows before the chip block. */
  fields?: number;
}

/** Reserves labelled inputs and a chip block while the saved profile loads. */
const ProfileFormSkeletonComponent: React.FC<ProfileFormSkeletonProps> = ({ fields = 3 }) => {
  const { sizes } = useTheme();

  return (
    <Box gap="2xl">
      <Box gap="lg">
        {Array.from({ length: fields }, (_, index) => (
          <Box key={index} gap="sm">
            <Skeleton width="30%" height={sizes.icon.xs} />
            <Skeleton width="100%" height={sizes.input.lg} borderRadius="md" />
          </Box>
        ))}
      </Box>
      <Box gap="md">
        <Skeleton width="40%" height={sizes.icon.sm} />
        <Skeleton width="100%" height={sizes.button.lg * 2} borderRadius="lg" />
      </Box>
    </Box>
  );
};

export const ProfileFormSkeleton = memo(ProfileFormSkeletonComponent);
