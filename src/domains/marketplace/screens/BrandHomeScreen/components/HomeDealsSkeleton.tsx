import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

/** About the loaded card's height: head, face row, a two-line action, the clock and the button. */
const CARD_HEIGHT = moderateScale(262);
const FACE = moderateScale(42);
const ROW_MIN = moderateScale(76);
const LANE_WIDTH = moderateScale(90);
const ROWS = ['a', 'b', 'c'] as const;

/** Same silhouette as «your deals»: the next-step card, the lane heading, three tracker rows. */
const HomeDealsSkeletonComponent: React.FC = () => {
  const { colors, typography } = useTheme();
  return (
    <Box gap="md" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box px="xl">
        <Skeleton width="100%" height={CARD_HEIGHT} borderRadius="xl" />
      </Box>
      <Box px="xl" mt="sm">
        <Skeleton width={LANE_WIDTH} height={typography.buttonSmall.lineHeight} borderRadius="xs" />
      </Box>
      <Box mx="xl" borderRadius="lg" bg={colors.surface.main} borderWidth="thin" borderColor={colors.border.card}>
        {ROWS.map(row => (
          <Box key={row} row align="center" gap="md" px="lg" py="md" minHeight={ROW_MIN}>
            <Skeleton width={FACE} height={FACE} borderRadius="full" />
            <Box flex={1} gap="md">
              <Skeleton width="55%" height={typography.bodyMedium.lineHeight} borderRadius="xs" />
              <Skeleton width="100%" height={moderateScale(8)} borderRadius="xs" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const HomeDealsSkeleton = memo(HomeDealsSkeletonComponent);
