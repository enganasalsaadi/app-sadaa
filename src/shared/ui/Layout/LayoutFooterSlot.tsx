import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
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
  /** `reveal`: the hero's height; the footer comes in once a share of it is scrolled away. */
  revealAfter?: SharedValue<number>;
  onLayout: (event: LayoutChangeEvent) => void;
}

/** Below this many px of hidden content the footer counts as "at the end" (float noise). */
const HIDDEN_CONTENT_EPSILON = 1;
/** `reveal`: share of the hero scrolled away before the footer comes in. */
const REVEAL_SHARE = 0.3;

const LayoutFooterSlotComponent: React.FC<LayoutFooterSlotProps> = ({
  children,
  bg,
  behavior,
  sticky,
  scrollY,
  contentHeight,
  viewportHeight,
  revealAfter,
  onLayout,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors, shadows } = useTheme();
  const raised = colors.surface.main;
  const lift = shadows.md;
  // Reveal needs a scroll position; without one (static body) the footer just stays raised.
  const reveal = behavior === 'reveal' && scrollY !== undefined;
  const ownHeight = useSharedValue(0);
  const [revealed, setRevealed] = useState(!reveal);

  const styles = useStyles(
    (theme): Record<'container' | 'divider' | 'floating', ViewStyle> => ({
      container: {
        backgroundColor: bg,
        paddingBottom: bottom,
        ...(behavior !== 'divider'
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
      floating: { position: 'absolute', start: 0, end: 0, bottom: 0 },
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
    if (behavior === 'divider') return {};
    // A floating footer always sits over content, so it is always raised.
    const lifted = behavior === 'reveal' ? 1 : covering.value;
    return {
      backgroundColor: interpolateColor(lifted, [0, 1], [bg, raised]),
      shadowOpacity: lifted * liftOpacity,
      elevation: lifted * liftElevation,
    };
  });

  const shown = useDerivedValue(() => {
    if (!reveal || !scrollY) return 1;
    const after = revealAfter ? revealAfter.value * REVEAL_SHARE : 0;
    return withTiming(scrollY.value > after ? 1 : 0, { duration: motion.duration.base });
  });

  // Touch and screen readers follow the slide: a hidden footer can't be tapped or focused.
  useAnimatedReaction(
    () => shown.value > 0.5,
    (now, previous) => {
      if (now !== previous) scheduleOnRN(setRevealed, now);
    },
  );

  const floatingStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * ownHeight.value }],
  }));

  const onContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      ownHeight.value = event.nativeEvent.layout.height;
      onLayout(event);
    },
    [onLayout, ownHeight],
  );

  const content = (
    <Animated.View style={[styles.container, containerStyle]} onLayout={onContainerLayout}>
      <Animated.View pointerEvents="none" style={[styles.divider, dividerStyle]} />
      {children}
    </Animated.View>
  );

  // The keyboard frame already covers the home-indicator area, so drop the inset while it's open.
  const placed = sticky ? <KeyboardStickyView offset={{ opened: bottom }}>{content}</KeyboardStickyView> : content;

  if (!reveal) return placed;

  // Floats over the body (Layout keeps room for it at the end) and slides in from below.
  return (
    <Animated.View
      style={[styles.floating, floatingStyle]}
      pointerEvents={revealed ? 'box-none' : 'none'}
      accessibilityElementsHidden={!revealed}
      importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}
    >
      {placed}
    </Animated.View>
  );
};

export const LayoutFooterSlot = memo(LayoutFooterSlotComponent);
