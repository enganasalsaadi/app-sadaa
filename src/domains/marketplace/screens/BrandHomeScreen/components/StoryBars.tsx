import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

export const STORY_BAR_HEIGHT = moderateScale(3);

/** Story progress bars over a deck card: one per creator, filled up to this card. */
const StoryBarsComponent: React.FC<{ count: number; current: number }> = ({ count, current }) => {
  const { colors } = useTheme();
  return (
    <Box row gap="xs" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          flex={1}
          height={STORY_BAR_HEIGHT}
          borderRadius="full"
          bg={i <= current ? colors.media.barActive : colors.media.bar}
        />
      ))}
    </Box>
  );
};

export const StoryBars = memo(StoryBarsComponent);
