import { useCallback, useMemo, useState } from 'react';
import { Vibration, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion } from '@/core/theme';

/** Drag past this (or flick faster than `THROW_VELOCITY`) and the top card flies off. */
export const DECK_THROW_DISTANCE = moderateScale(90);
const THROW_VELOCITY = 800;
/** Horizontal travel before the pan claims the touch; vertical travel first → page scroll wins. */
const ACTIVE_OFFSET = 12;
const FAIL_OFFSET = 14;
/** How far past the screen edge a thrown card travels, in screen widths. */
const THROW_SCREENS = 1.3;

export interface StoryDeckModel {
  /** Pan on the top card. */
  gesture: ReturnType<typeof Gesture.Pan>;
  /** How many cards have been thrown (grows forever; position = (index - base) mod count). */
  base: SharedValue<number>;
  /** Top card's horizontal drag. */
  drag: SharedValue<number>;
  /** Index of the card on top, for bars, a11y and taps. */
  top: number;
  /** Throws the top card (screen readers' "next" action). */
  next: () => void;
}

/**
 * Story deck motion (Brand Home signature): the top card follows the finger and tilts; past the
 * threshold it is thrown off screen, the cards behind step forward and the thrown one goes to
 * the back, so the deck loops. A light tick confirms each throw.
 */
export const useStoryDeck = (count: number): StoryDeckModel => {
  const { width } = useWindowDimensions();
  const base = useSharedValue(0);
  const drag = useSharedValue(0);
  const [top, setTop] = useState(0);
  const offscreen = width * THROW_SCREENS;

  const onThrown = useCallback(
    (thrown: number) => {
      setTop(count > 0 ? thrown % count : 0);
      Vibration.vibrate(HAPTIC_TAP_MS);
    },
    [count],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(count > 1)
        .activeOffsetX([-ACTIVE_OFFSET, ACTIVE_OFFSET])
        .failOffsetY([-FAIL_OFFSET, FAIL_OFFSET])
        .onUpdate(event => {
          drag.value = event.translationX;
        })
        .onEnd(event => {
          const thrown =
            Math.abs(event.translationX) > DECK_THROW_DISTANCE ||
            Math.abs(event.velocityX) > THROW_VELOCITY;
          if (!thrown) {
            drag.value = withSpring(0, motion.spring);
            return;
          }
          const direction = Math.sign(event.translationX || event.velocityX);
          drag.value = withTiming(direction * offscreen, { duration: motion.duration.base }, done => {
            if (!done) return;
            // Same frame: the next card takes over at the spot the drag already brought it to.
            base.value += 1;
            drag.value = 0;
            scheduleOnRN(onThrown, base.value);
          });
        }),
    [base, count, drag, offscreen, onThrown],
  );

  const next = useCallback(() => {
    if (count < 2) return;
    drag.value = withTiming(-offscreen, { duration: motion.duration.base }, done => {
      if (!done) return;
      base.value += 1;
      drag.value = 0;
      scheduleOnRN(onThrown, base.value);
    });
  }, [base, count, drag, offscreen, onThrown]);

  // A refresh can shrink the rail under a deep `top`; wrap it back into range.
  return { gesture, base, drag, top: count > 0 ? top % count : 0, next };
};
