import React, { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { moderateScale, useTheme } from '@/core/theme';
import { useLayoutInView } from '@/shared/ui';

/** `up` rises from below · `side` slides in from the reading end · `pop` springs from small. */
export type MediaKitRiseFrom = 'up' | 'side' | 'pop';

const RISE = moderateScale(26);
const SIDE = moderateScale(40);
const POP_SCALE = 0.82;

interface MediaKitRiseProps {
  children: React.ReactNode;
  from?: MediaKitRiseFrom;
  /** Stagger after siblings, ms. */
  delay?: number;
}

/**
 * Plays a section's entrance the first time it scrolls into view. Transforms only (an
 * animated opacity left views blank on device), so content is never hidden if motion stops.
 */
const MediaKitRiseComponent: React.FC<MediaKitRiseProps> = ({ children, from = 'up', delay }) => {
  const { isRTL } = useTheme();
  const { ref, onLayout, progress } = useLayoutInView({ delay });
  const side = isRTL ? -SIDE : SIDE;

  const style = useAnimatedStyle(() => {
    const rest = 1 - progress.value;
    switch (from) {
      case 'side':
        return { transform: [{ translateX: rest * side }] };
      case 'pop':
        return { transform: [{ scale: POP_SCALE + (1 - POP_SCALE) * progress.value }] };
      default:
        return { transform: [{ translateY: rest * RISE }] };
    }
  }, [from, side]);

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={style}>
      {children}
    </Animated.View>
  );
};

export const MediaKitRise = memo(MediaKitRiseComponent);
