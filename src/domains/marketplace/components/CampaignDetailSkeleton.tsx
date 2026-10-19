import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const HERO_HEIGHT = moderateScale(208);

/** First load of a campaign: the short cover's place kept under the header, then the quick actions, the «now» card and the terms. */
const CampaignDetailSkeletonComponent: React.FC = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      header={{ title: '', variant: 'brand' }}
      hero={<Box height={HERO_HEIGHT + top} bg={colors.brand.main} />}
    >
      <Box px="xl" pt="lg" gap="lg">
        <Skeleton width="100%" height={moderateScale(96)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(220)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(180)} borderRadius="xl" />
      </Box>
    </Layout>
  );
};

export const CampaignDetailSkeleton = memo(CampaignDetailSkeletonComponent);
