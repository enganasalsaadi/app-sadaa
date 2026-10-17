import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '@/core/theme';
import { Box, Layout, Skeleton } from '@/shared/ui';

const ROWS = 5;

/** First load of the comparison: the columns' heads, then the rows' places. */
const CompareSkeletonComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout header={{ title: t('marketplace.campaign.applicants.compare.result.title') }}>
      <Box gap="lg">
        <Box row gap="sm">
          {[0, 1, 2].map(column => (
            <Box key={column} flex={1} align="center" gap="xs">
              <Skeleton width={moderateScale(76)} height={moderateScale(76)} borderRadius="full" />
              <Skeleton width="70%" height={moderateScale(16)} />
            </Box>
          ))}
        </Box>
        {Array.from({ length: ROWS }, (_, row) => (
          <Skeleton key={row} width="100%" height={moderateScale(72)} borderRadius="md" />
        ))}
      </Box>
    </Layout>
  );
};

export const CompareSkeleton = memo(CompareSkeletonComponent);
