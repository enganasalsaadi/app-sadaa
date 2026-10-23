import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Skeleton } from '@/shared/ui';

const TILE_ROWS = 2;
const COLUMNS = 3;

/** First load: the deck and two rows of tiles, in their real places. */
const VaultSkeletonComponent: React.FC = () => {
  const { sizes } = useTheme();
  return (
    <Box px="xl" pt="sm" gap="lg" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton width="100%" height={sizes.vault.deckHeight} borderRadius="xl" />
      <Skeleton width="40%" height={sizes.icon.md} borderRadius="xs" />
      {Array.from({ length: TILE_ROWS }, (_, row) => (
        <Box key={row} row gap="xs">
          {Array.from({ length: COLUMNS }, (__, column) => (
            <Box key={column} flex={1}>
              <Skeleton width="100%" height={sizes.thumbnail.lg} borderRadius="md" />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const VaultSkeleton = memo(VaultSkeletonComponent);
