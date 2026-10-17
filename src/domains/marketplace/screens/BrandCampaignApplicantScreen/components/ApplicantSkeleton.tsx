import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const HERO_HEIGHT = moderateScale(320);

/** First load of an applicant: the photo's place kept under the header, then the cards. */
const ApplicantSkeletonComponent: React.FC = () => {
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
        <Skeleton width="100%" height={moderateScale(88)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(120)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(72)} borderRadius="xl" />
        <Skeleton width="100%" height={moderateScale(72)} borderRadius="xl" />
      </Box>
    </Layout>
  );
};

export const ApplicantSkeleton = memo(ApplicantSkeletonComponent);
