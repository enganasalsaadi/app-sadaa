import React, { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const ORBIT_MAX = moderateScale(300);
const ORBIT_ROOM = moderateScale(38);

/** First load of a deal: the navy hero with the orbit's place kept, then the cards below. */
const DealDetailSkeletonComponent: React.FC = () => {
  const { spacing, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const ring = Math.min(width - spacing.xl * 2, ORBIT_MAX) - ORBIT_ROOM * 2;
  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      header={{ title: '', variant: 'brand' }}
      hero={
        <Box pt="sm" px="xl" pb="4xl" gap="lg" align="center">
          <Box height={top + sizes.iconButton.md} />
          <Skeleton
            width={ring}
            height={ring}
            borderRadius="full"
            surface="brand"
          />
          <Skeleton
            width="100%"
            height={moderateScale(28)}
            borderRadius="full"
            surface="brand"
          />
        </Box>
      }
    >
      <Box px="xl" pt="2xl" gap="lg">
        <Skeleton width="100%" height={moderateScale(110)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(220)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(140)} borderRadius="xl" />
      </Box>
    </Layout>
  );
};

export const DealDetailSkeleton = memo(DealDetailSkeletonComponent);
