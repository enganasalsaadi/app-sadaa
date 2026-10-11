import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';
import { STORY_DECK_HEIGHT } from './StoryDeck';

const TITLE_WIDTH = '50%';
const FAST_ROWS = ['a', 'b', 'c'] as const;
const ROW_PHOTO = moderateScale(72);

/** Same footprint as the loaded rails: a heading, the deck, then list rows. No spinner. */
const HomeSkeletonComponent: React.FC = () => {
  const { typography } = useTheme();
  return (
    <Box gap="lg" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box px="xl">
        <Skeleton width={TITLE_WIDTH} height={typography.h3.lineHeight} borderRadius="xs" />
      </Box>
      <Box px="xl">
        <Skeleton width="100%" height={STORY_DECK_HEIGHT} borderRadius="xl" />
      </Box>
      <Box px="xl" gap="md" mt="xl">
        <Skeleton width={TITLE_WIDTH} height={typography.h3.lineHeight} borderRadius="xs" />
        {FAST_ROWS.map(row => (
          <Box key={row} row align="center" gap="md">
            <Skeleton width={ROW_PHOTO} height={ROW_PHOTO} borderRadius="lg" />
            <Box flex={1} gap="sm">
              <Skeleton width="70%" height={typography.bodyMedium.lineHeight} borderRadius="xs" />
              <Skeleton width="45%" height={typography.caption.lineHeight} borderRadius="xs" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const HomeSkeleton = memo(HomeSkeletonComponent);
