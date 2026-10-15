import React, { memo } from 'react';
import { useCountdown } from '@/core/hooks';
import type { TypographyVariant } from '@/core/theme';
import { Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import { formatClock } from '../utils/dealTimer';

export interface DealDisputeClockProps {
  /** The evidence window's close, from the server. */
  endsAt: number;
  variant: TypographyVariant;
  color: string;
}

/** The evidence window ticking down as a clock face («18:42:10»); its own tick, so nothing else re-renders. */
const DealDisputeClockComponent: React.FC<DealDisputeClockProps> = ({ endsAt, variant, color }) => {
  const seconds = useCountdown(endsAt);
  return (
    <Text variant={variant} color={color}>
      {isolateLtr(formatClock(seconds))}
    </Text>
  );
};

export const DealDisputeClock = memo(DealDisputeClockComponent);
