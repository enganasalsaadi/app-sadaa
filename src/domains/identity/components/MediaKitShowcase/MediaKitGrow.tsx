import React, { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { useLayoutInView } from '@/shared/ui';

interface MediaKitGrowProps {
  children?: React.ReactNode;
  /** `x` grows from the reading-start edge, `y` up from the bottom. */
  axis: 'x' | 'y';
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** A bar that grows to its size the first time it scrolls into view (scale only, UI thread). */
const MediaKitGrowComponent: React.FC<MediaKitGrowProps> = ({ children, axis, delay, style }) => {
  const { isRTL } = useTheme();
  const { ref, onLayout, progress } = useLayoutInView({ delay });
  const origin = axis === 'y' ? 'bottom' : isRTL ? 'right' : 'left';

  const grow = useAnimatedStyle(
    () => ({
      transformOrigin: origin,
      transform: axis === 'y' ? [{ scaleY: progress.value }] : [{ scaleX: progress.value }],
    }),
    [axis, origin],
  );

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={[style, grow]}>
      {children}
    </Animated.View>
  );
};

export const MediaKitGrow = memo(MediaKitGrowComponent);
