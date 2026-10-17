import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const TOTALS_HEIGHT = moderateScale(84);
const PARCEL_HEIGHT = moderateScale(120);

/** First load of the manifest: the counts strip and a few parcel cards. */
const ShippingSkeletonComponent: React.FC = () => (
  <Layout mode="static" header={{ title: '' }}>
    <Box gap="lg">
      <Skeleton width="100%" height={TOTALS_HEIGHT} borderRadius="lg" />
      {[0, 1, 2].map(index => (
        <Skeleton key={index} width="100%" height={PARCEL_HEIGHT} borderRadius="lg" />
      ))}
    </Box>
  </Layout>
);

export const ShippingSkeleton = memo(ShippingSkeletonComponent);
