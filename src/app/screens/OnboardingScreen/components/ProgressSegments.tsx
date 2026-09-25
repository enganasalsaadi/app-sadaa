import React, { memo } from 'react';
import { Box } from '@/shared/ui';
import { useTheme } from '@/core/theme';

interface ProgressSegmentsProps {
  current: number;
  total: number;
  accessibilityLabel: string;
}

const ProgressSegmentsComponent: React.FC<ProgressSegmentsProps> = ({
  current,
  total,
  accessibilityLabel,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <Box
      row
      gap="xs"
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Box
          key={i}
          flex={1}
          height={spacing.xs}
          borderRadius="full"
          bg={i <= current ? colors.glass.progressFill : colors.glass.progressTrack}
        />
      ))}
    </Box>
  );
};

export const ProgressSegments = memo(ProgressSegmentsComponent);
