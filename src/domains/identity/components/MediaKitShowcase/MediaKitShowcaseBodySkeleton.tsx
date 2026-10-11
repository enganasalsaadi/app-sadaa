import React, { memo } from 'react';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const RAIL_CARD = { width: moderateScale(148), height: moderateScale(64) } as const;
const SERVICE_HEIGHT = moderateScale(112);
const RAIL = ['a', 'b', 'c'] as const;
const SERVICES = ['a', 'b'] as const;

/** Sheet placeholder where the content lands: avatar on the cover edge, name, meta, bio, platforms, services. */
const MediaKitShowcaseBodySkeletonComponent: React.FC = () => {
  const { sizes, borderWidths } = useTheme();
  const ring = sizes.avatar.xl + borderWidths.xl * 2;
  const styles = useStyles(() => ({ overlap: { marginTop: -ring / 2 } }), [ring]);

  return (
    <Box gap="2xl">
      <Box align="center" gap="sm" px="xl">
        <Box style={styles.overlap}>
          <Skeleton width={ring} height={ring} borderRadius="full" />
        </Box>
        <Skeleton width="50%" height={sizes.icon.lg} borderRadius="xs" />
        <Skeleton width="30%" height={sizes.icon.md} borderRadius="xs" />
        <Skeleton width="80%" height={sizes.icon.md} borderRadius="xs" />
      </Box>
      <Box row px="xl" gap="md">
        {RAIL.map(key => (
          <Skeleton key={key} width={RAIL_CARD.width} height={RAIL_CARD.height} borderRadius="lg" />
        ))}
      </Box>
      <Box px="xl" gap="md">
        <Skeleton width="45%" height={sizes.icon.md} borderRadius="xs" />
        {SERVICES.map(key => (
          <Skeleton key={key} width="100%" height={SERVICE_HEIGHT} borderRadius="lg" />
        ))}
      </Box>
    </Box>
  );
};

export const MediaKitShowcaseBodySkeleton = memo(MediaKitShowcaseBodySkeletonComponent);
