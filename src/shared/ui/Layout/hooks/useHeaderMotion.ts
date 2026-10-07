import { useState } from 'react';
import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { motion } from '@/core/theme';
import type { ScreenHeaderMotion } from '../../ScreenHeader';
import type { LayoutHeaderBehavior } from '../types';

/** Below this many px of scroll the header counts as "at rest" (float noise). */
const SCROLL_EPSILON = 1;
/** Collapse: the bar title starts fading in once half the large title has scrolled away. */
const COLLAPSE_REVEAL_START = 0.5;

interface HeaderMotionInput {
  behavior: LayoutHeaderBehavior;
  scrollY: SharedValue<number>;
  /** Measured height of the header, status-bar strip included. */
  headerHeight: SharedValue<number>;
  /** `hideOnScroll` keeps this strip (the status bar) covered. */
  topInset: number;
  heroHeight: SharedValue<number>;
  largeTitleHeight: SharedValue<number>;
}

export interface HeaderMotionState {
  motion: ScreenHeaderMotion;
  /** `hideOnScroll`: how far the header has slid up (≤ 0). */
  translateY: DerivedValue<number>;
  /** `overlay`: the bar has faded in, so the status bar should follow the surface again. */
  overlaySolid: boolean;
}

/** Scroll → header progress values. All on the UI thread; JS only hears the overlay flip. */
export const useHeaderMotion = ({
  behavior,
  scrollY,
  headerHeight,
  topInset,
  heroHeight,
  largeTitleHeight,
}: HeaderMotionInput): HeaderMotionState => {
  const hidden = useSharedValue(0);
  const [overlaySolid, setOverlaySolid] = useState(false);

  const background = useDerivedValue(() => {
    if (behavior !== 'overlay') return 1;
    // Not measured yet: stay transparent rather than flash a solid bar over the hero.
    if (heroHeight.value === 0 || headerHeight.value === 0) return 0;
    // Solid once the hero has scrolled out from under the bar. The fade never starts
    // before the first px of scroll, even when the hero is barely taller than the bar.
    const end = Math.max(heroHeight.value - headerHeight.value, SCROLL_EPSILON);
    const start = Math.max(end - headerHeight.value, 0);
    return interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP);
  });

  const title = useDerivedValue(() => {
    if (behavior === 'overlay') return background.value;
    if (behavior !== 'collapse') return 1;
    const full = largeTitleHeight.value;
    if (full === 0) return 0;
    return interpolate(scrollY.value, [full * COLLAPSE_REVEAL_START, full], [0, 1], Extrapolation.CLAMP);
  });

  const divider = useDerivedValue<number>(() => {
    const threshold =
      behavior === 'collapse'
        ? largeTitleHeight.value
        : behavior === 'overlay'
          ? heroHeight.value - headerHeight.value
          : SCROLL_EPSILON;
    return withTiming(scrollY.value > threshold ? 1 : 0, { duration: motion.duration.fast });
  });

  // Diff-clamp: every px scrolled down hides a px of header, every px up shows one.
  useAnimatedReaction(
    () => scrollY.value,
    (y, previous) => {
      if (behavior !== 'hideOnScroll') return;
      if (y <= 0) {
        hidden.value = 0;
        return;
      }
      const range = Math.max(headerHeight.value - topInset, 0);
      const next = hidden.value + (y - (previous ?? y));
      hidden.value = Math.min(Math.max(next, 0), range);
    },
    [behavior, topInset],
  );

  const translateY = useDerivedValue(() => -hidden.value);

  useAnimatedReaction(
    () => behavior === 'overlay' && background.value >= 1,
    (solid, previous) => {
      if (solid !== previous) scheduleOnRN(setOverlaySolid, solid);
    },
    [behavior],
  );

  return {
    motion: { background: behavior === 'overlay' ? background : undefined, title, divider },
    translateY,
    overlaySolid,
  };
};
