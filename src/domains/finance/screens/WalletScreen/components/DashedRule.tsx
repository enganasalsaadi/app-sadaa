import React, { memo } from 'react';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const DASH = [6, 5];
const STROKE = 1.5;

/** A printed dashed rule across its parent (receipt rows, the rate line). Drawn: RN dashes one side unevenly. */
const DashedRuleComponent: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Box height={STROKE} pointerEvents="none">
      <Svg height={STROKE} width="100%">
        <Line
          x1="0"
          y1={STROKE / 2}
          x2="100%"
          y2={STROKE / 2}
          stroke={colors.border.default}
          strokeWidth={STROKE}
          strokeDasharray={DASH}
        />
      </Svg>
    </Box>
  );
};

export const DashedRule = memo(DashedRuleComponent);
