import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const AVATAR = moderateScale(96);
const STRIP_HEIGHT = moderateScale(76);

/** Navy hero placeholder: avatar, name, tier and the metrics strip, where they will land. */
const MediaKitShowcaseHeroSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    ({ spacing }) => ({ container: { paddingTop: top + sizes.iconButton.md + spacing.md } }),
    [top, sizes.iconButton.md],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="xl">
      <Box align="center" gap="md">
        <Skeleton width={AVATAR} height={AVATAR} borderRadius="full" surface="brand" />
        <Skeleton width="50%" height={sizes.icon.lg} borderRadius="xs" surface="brand" />
        <Skeleton width="30%" height={sizes.icon.md} borderRadius="xs" surface="brand" />
      </Box>
      <Skeleton width="100%" height={STRIP_HEIGHT} borderRadius="lg" surface="brand" />
    </Box>
  );
};

export const MediaKitShowcaseHeroSkeleton = memo(MediaKitShowcaseHeroSkeletonComponent);
