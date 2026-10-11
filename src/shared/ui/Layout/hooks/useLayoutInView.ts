import { useCallback, useContext, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { NavigationContext } from '@react-navigation/native';
import { motion } from '@/core/theme';
import { useLayoutContext } from '../LayoutContext';

/** A view starts its entrance once its top passes this share of the window height. */
const REVEAL_AT = 0.88;
/**
 * Between measurements a view's position is worked out from the scroll distance alone; it is
 * only measured again within this share of the window height of a line that matters (reveal,
 * window edges), or after its own layout changes. Dozens of views on a page then cost almost
 * no measuring per scroll frame, and a shift from content above is corrected near the line.
 */
const MEASURE_NEAR = 0.25;
const REVEAL_EASING = Easing.bezier(0.22, 1, 0.36, 1);

export interface LayoutInViewOptions {
  /** Wait before the entrance starts, ms (stagger siblings). */
  delay?: number;
  /**
   * Keep measuring after the entrance to report `visible` (loops that pause off screen).
   * Off by default: a view that only rises in stops costing anything once it has.
   */
  track?: boolean;
}

/**
 * Where a view sits inside Layout's scroll body, followed on the UI thread as the body
 * scrolls (no JS work per frame). `progress` runs 0 → 1 once, the first time the view comes
 * into view: drive entrances from it with transforms. `revealed` is the same moment as React
 * state (mount a counter so it rolls on screen). With `track`, `visible` follows the view in
 * and out of the window and is false while the screen is blurred: run loops only then.
 * Outside a scrolling Layout, or under reduced motion, everything is revealed at once.
 */
export const useLayoutInView = ({ delay = 0, track = false }: LayoutInViewOptions = {}) => {
  const ref = useAnimatedRef<Animated.View>();
  const { scrollY } = useLayoutContext();
  const navigation = useContext(NavigationContext);
  const { height: windowHeight } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const immediate = reduceMotion || scrollY === null;
  const progress = useSharedValue(immediate ? 1 : 0);
  const started = useSharedValue(immediate);
  // Bumped on layout so a view that never scrolls (top of the page) is still measured.
  const laidOut = useSharedValue(0);
  const wasOnScreen = useSharedValue(scrollY === null);
  // Last measurement: page top, height, the scroll offset then and the layout it belonged to.
  const lastTop = useSharedValue(0);
  const lastHeight = useSharedValue(0);
  const lastScroll = useSharedValue(0);
  const lastLayout = useSharedValue(0);
  const [revealed, setRevealed] = useState(immediate);
  const [onScreen, setOnScreen] = useState(scrollY === null);
  const [focused, setFocused] = useState(() => navigation?.isFocused() !== false);

  useEffect(() => {
    if (!track || !navigation) return undefined;
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation, track]);

  useAnimatedReaction(
    // A fresh tuple each run: re-check on every scroll step and every layout.
    () => [scrollY ? scrollY.value : 0, laidOut.value],
    () => {
      if (scrollY === null || laidOut.value === 0) return;
      if (started.value && !track) return;
      const y = scrollY.value;
      let top = lastTop.value - (y - lastScroll.value);
      let height = lastHeight.value;
      const near = (line: number) => Math.abs(top - line) < windowHeight * MEASURE_NEAR;
      const stale =
        lastLayout.value !== laidOut.value ||
        (!started.value && near(windowHeight * REVEAL_AT)) ||
        (track && (near(windowHeight) || near(-height)));
      if (stale) {
        const box = measure(ref);
        if (box === null) return;
        top = box.pageY;
        height = box.height;
        lastTop.value = top;
        lastHeight.value = height;
        lastScroll.value = y;
        lastLayout.value = laidOut.value;
      }
      if (!started.value && top < windowHeight * REVEAL_AT) {
        started.value = true;
        progress.value = withDelay(
          delay,
          withTiming(1, { duration: motion.duration.rise, easing: REVEAL_EASING }),
        );
        scheduleOnRN(setRevealed, true);
      }
      if (!track) return;
      const inWindow = top < windowHeight && top + height > 0;
      // Only a change crosses to JS, never every scroll frame.
      if (inWindow !== wasOnScreen.value) {
        wasOnScreen.value = inWindow;
        scheduleOnRN(setOnScreen, inWindow);
      }
    },
    [delay, track, windowHeight],
  );

  const onLayout = useCallback(() => {
    laidOut.value += 1;
  }, [laidOut]);

  return { ref, onLayout, progress, revealed, visible: onScreen && focused };
};
