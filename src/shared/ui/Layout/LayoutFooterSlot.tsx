import React, { memo } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { motion, useStyles, useTheme } from '@/core/theme';
import type { LayoutFooterBehavior } from './types';

interface LayoutFooterSlotProps {
  children: React.ReactNode;
  bg: string;
  behavior: LayoutFooterBehavior;
  /** Rides on top of the keyboard instead of being covered by it. */
  sticky: boolean;
  /** Scroll mode: tells whether content continues under the footer. */
  scrollY?: SharedValue<number>;
  contentHeight?: SharedValue<number>;
  viewportHeight?: SharedValue<number>;
  onLayout: (event: LayoutChangeEvent) => void;
}

/** Below this many px of hidden content the footer counts as "at the end" (float noise). */
const HIDDEN_CONTENT_EPSILON = 1;

const LayoutFooterSlotComponent: React.FC<LayoutFooterSlotProps> = ({
  children,
  bg,
  behavior,
  sticky,
  scrollY,
  contentHeight,
  viewportHeight,
  onLayout,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors, shadows } = useTheme();
  const raised = colors.surface.main;
  const lift = shadows.md;

  const styles = useStyles(
    (theme): Record<'container' | 'divider', ViewStyle> => ({
      container: {
        backgroundColor: bg,
        paddingBottom: bottom,
        ...(behavior === 'elevate'
          ? {
              shadowColor: lift.shadowColor,
              shadowOffset: { width: 0, height: -(lift.shadowOffset?.height ?? 0) },
              shadowRadius: lift.shadowRadius,
            }
          : null),
      },
      divider: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border.default,
      },
    }),
    [bg, bottom, behavior, lift],
  );

  const covering = useDerivedValue(() => {
    if (!scrollY || !contentHeight || !viewportHeight) return 0;
    const hidden = contentHeight.value - viewportHeight.value - scrollY.value;
    return withTiming(hidden > HIDDEN_CONTENT_EPSILON ? 1 : 0, { duration: motion.duration.fast });
  });

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: behavior === 'divider' ? covering.value : 0,
  }));

  const liftOpacity = lift.shadowOpacity ?? 0;
  const liftElevation = lift.elevation ?? 0;
  const containerStyle = useAnimatedStyle(() => {
    if (behavior !== 'elevate') return {};
    return {
      backgroundColor: interpolateColor(covering.value, [0, 1], [bg, raised]),
      shadowOpacity: covering.value * liftOpacity,
      elevation: covering.value * liftElevation,
    };
  });

  const content = (
    <Animated.View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <Animated.View pointerEvents="none" style={[styles.divider, dividerStyle]} />
      {children}
    </Animated.View>
  );

  if (!sticky) return content;

  // The keyboard frame already covers the home-indicator area, so drop the inset while it's open.
  return <KeyboardStickyView offset={{ opened: bottom }}>{content}</KeyboardStickyView>;
};

export const LayoutFooterSlot = memo(LayoutFooterSlotComponent);
