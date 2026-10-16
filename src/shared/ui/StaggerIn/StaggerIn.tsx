import React, { Children, isValidElement, memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { SpacingToken } from '@/core/theme/types';
import { motion } from '@/core/theme';
import { Box } from '../primitives/Box';

export interface StaggerInProps {
  children: React.ReactNode;
  /** Gap between the children, as on `Box`. */
  gap?: SpacingToken;
}

/**
 * Stacks its children and lets them rise in one after another on first mount
 * (rule 09 §3.1, dashboard sections). Entering animations run once and follow the
 * system reduced-motion setting. `null` / `false` children keep no slot, but a component child
 * that renders `null` still does (and still gets `gap` around it): skip it before passing it in.
 */
const StaggerInComponent: React.FC<StaggerInProps> = ({ children, gap }) => {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <Box gap={gap}>
      {items.map((child, index) => (
        <Animated.View
          key={child.key ?? index}
          entering={FadeInDown.duration(motion.duration.rise).delay(index * motion.stagger)}
        >
          {child}
        </Animated.View>
      ))}
    </Box>
  );
};

export const StaggerIn = memo(StaggerInComponent);
