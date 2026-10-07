import React, { memo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Box } from '../primitives/Box';

interface LayoutHeroProps {
  children: React.ReactNode;
  scrollY: SharedValue<number>;
  /** Fraction of the scroll the hero lags behind the body (0 = scrolls with it). */
  parallax: number;
  onLayout: (event: LayoutChangeEvent) => void;
}

/** The hero slot: measured for the header motion, shifted down while scrolling for parallax. */
const LayoutHeroComponent: React.FC<LayoutHeroProps> = ({ children, scrollY, parallax, onLayout }) => {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(scrollY.value, 0) * parallax }],
  }));

  return (
    <Animated.View style={style}>
      <Box onLayout={onLayout}>{children}</Box>
    </Animated.View>
  );
};

export const LayoutHero = memo(LayoutHeroComponent);
