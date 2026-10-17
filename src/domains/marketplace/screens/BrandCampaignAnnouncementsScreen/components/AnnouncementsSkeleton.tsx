import React, { memo } from 'react';
import { moderateScale } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const QUOTA_HEIGHT = moderateScale(52);
const EDITOR_HEIGHT = moderateScale(200);
const CARD_HEIGHT = moderateScale(92);

/** First load: the quota strip, the editor and a couple of history cards (the quota is unknown until the history is). */
const AnnouncementsSkeletonComponent: React.FC = () => (
  <Layout mode="static" header={{ title: '' }}>
    <Box gap="lg">
      <Skeleton width="100%" height={QUOTA_HEIGHT} borderRadius="lg" />
      <Skeleton width="100%" height={EDITOR_HEIGHT} borderRadius="lg" />
      {[0, 1].map(index => (
        <Skeleton key={index} width="100%" height={CARD_HEIGHT} borderRadius="lg" />
      ))}
    </Box>
  </Layout>
);

export const AnnouncementsSkeleton = memo(AnnouncementsSkeletonComponent);
