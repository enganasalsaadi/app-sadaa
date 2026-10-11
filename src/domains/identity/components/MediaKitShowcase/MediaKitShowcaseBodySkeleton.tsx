import React, { memo } from 'react';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Skeleton, useHeroCompact } from '@/shared/ui';
import { PLATFORM_CARD_WIDTH } from './MediaKitPlatformsRail';

const PLATFORM_CARD_HEIGHT = moderateScale(72);
const SERVICE_HEIGHT = moderateScale(112);
const RAIL = ['a', 'b', 'c'] as const;
const SERVICES = ['a', 'b'] as const;

/** Sheet placeholder where the content lands: avatar on the cover edge, name, meta, bio, platforms, services. */
const MediaKitShowcaseBodySkeletonComponent: React.FC = () => {
  const { sizes, borderWidths } = useTheme();
  // Same avatar size as the identity it stands in for, so nothing jumps when it lands.
  const compact = useHeroCompact();
  const ring = (compact ? sizes.avatar.lg : sizes.avatar.xl) + borderWidths.xl * 2;
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
          <Skeleton key={key} width={PLATFORM_CARD_WIDTH} height={PLATFORM_CARD_HEIGHT} borderRadius="lg" />
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
