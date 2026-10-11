import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';
import { MediaKitCoverFrame } from './MediaKitCoverFrame';

/** Reserves the cover frame, the link field and the visibility row while the kit loads. */
const MediaKitSettingsSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();

  return (
    <Box gap="3xl">
      <Box gap="md">
        <Skeleton width="30%" height={sizes.icon.sm} borderRadius="xs" />
        <MediaKitCoverFrame>
          <Skeleton fill width="100%" height="100%" borderRadius="lg" />
        </MediaKitCoverFrame>
      </Box>
      <Box gap="md">
        <Skeleton width="30%" height={sizes.icon.sm} borderRadius="xs" />
        <Skeleton width="100%" height={sizes.input.lg} borderRadius="md" />
        <Skeleton width="60%" height={sizes.icon.xs} borderRadius="xs" />
      </Box>
      <Skeleton width="100%" height={sizes.button.lg} borderRadius="lg" />
    </Box>
  );
};

export const MediaKitSettingsSkeleton = memo(MediaKitSettingsSkeletonComponent);
