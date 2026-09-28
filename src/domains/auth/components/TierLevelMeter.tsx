import React, { memo } from 'react';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';
import { FOLLOWER_TIER_LEVELS } from '../constants/influencerOnboarding';

const BAR_WIDTH = moderateScale(4);
const BAR_MIN_HEIGHT = moderateScale(6);
const BAR_STEP = moderateScale(3);

interface TierLevelMeterProps {
  level: number;
  color: string;
}

/** Rising bars (reach, like an echo growing): `level` of 5 filled, so tiers never differ by color alone. */
export const TierLevelMeter: React.FC<TierLevelMeterProps> = memo(({ level, color }) => {
  const { colors } = useTheme();
  return (
    <Box row align="flex-end" gap="xs" accessibilityElementsHidden>
      {Array.from({ length: FOLLOWER_TIER_LEVELS }, (_, i) => (
        <Box
          key={i}
          width={BAR_WIDTH}
          height={BAR_MIN_HEIGHT + i * BAR_STEP}
          borderRadius="full"
          bg={i < level ? color : colors.border.default}
        />
      ))}
    </Box>
  );
});
