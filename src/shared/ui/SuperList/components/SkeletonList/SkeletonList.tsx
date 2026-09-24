import React from 'react';
import { Box } from '../../../primitives/Box';
import { SkeletonItem } from '../SkeletonItem';
import type { ListLayout } from '../../types';

interface SkeletonListProps {
  count?: number;
  layout?: ListLayout;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 6,
  layout = 'list',
}) => {
  if (layout === 'list') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonItem key={i} variant="list" />
        ))}
      </>
    );
  }

  const cols = layout === 'grid-3' ? 3 : 2;
  const rows = Math.ceil(count / cols);

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} row>
          {Array.from({ length: cols }).map((__, colIndex) => {
            const index = rowIndex * cols + colIndex;
            if (index >= count) {
              // Filler to keep grid balanced
              return <Box key={colIndex} flex={1} m="xs" />;
            }
            return <SkeletonItem key={colIndex} variant="grid" />;
          })}
        </Box>
      ))}
    </>
  );
};
