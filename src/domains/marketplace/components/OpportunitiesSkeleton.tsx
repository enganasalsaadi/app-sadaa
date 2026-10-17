import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { moderateScale, useStyles } from '@/core/theme';
import { Box, Card, Skeleton } from '@/shared/ui';

const COVER = moderateScale(158);
const CHIP = moderateScale(28);
const ROWS = ['a', 'b'] as const;

/** First load of the feed: tickets with their cover, chips and stub already holding their space. */
const OpportunitiesSkeletonComponent: React.FC = () => {
  const styles = useStyles(
    (): Record<'card', ViewStyle> => ({
      card: { overflow: 'hidden', padding: 0 },
    }),
  );
  return (
    <Box gap="lg">
      {ROWS.map(row => (
        <Card key={row} style={styles.card}>
          <Skeleton width="100%" height={COVER} borderRadius="xs" />
          <Box p="lg" gap="md">
            <Skeleton width="70%" height={moderateScale(20)} />
            <Box row gap="sm">
              <Skeleton
                width={moderateScale(88)}
                height={CHIP}
                borderRadius="full"
              />
              <Skeleton
                width={moderateScale(72)}
                height={CHIP}
                borderRadius="full"
              />
            </Box>
            <Box row justify="space-between" pt="md">
              <Skeleton width={moderateScale(96)} height={moderateScale(34)} />
              <Skeleton width={moderateScale(88)} height={moderateScale(34)} />
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export const OpportunitiesSkeleton = memo(OpportunitiesSkeletonComponent);
