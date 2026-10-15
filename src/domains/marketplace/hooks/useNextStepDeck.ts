import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Vibration, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion } from '@/core/theme';

/** Drag past this (or flick faster than `THROW_VELOCITY`) and the card flies off. */
const THROW_DISTANCE = moderateScale(70);
const THROW_VELOCITY = 800;
/** Horizontal travel before the pan claims the touch; vertical first → the page scrolls. */
const ACTIVE_OFFSET = 12;
const FAIL_OFFSET = 14;
/** How far past the edge a thrown card travels, in screen widths. */
const THROW_SCREENS = 1.2;

export interface NextStepDeckModel {
  gesture: ReturnType<typeof Gesture.Pan>;
  /** Card's horizontal drag (it tilts and fades with it). */
  drag: SharedValue<number>;
  /** 1 → 0 as the next card rises from behind into place. */
  enter: SharedValue<number>;
  /** The card on top. */
  index: number;
  /** The arrow (and screen readers' «next»): throws the card the way a swipe would. */
  next: () => void;
}

/**
 * Next-step card motion: the card follows the finger and tilts; past the threshold (or on the
 * arrow) it is thrown off, the deck moves to the next deal with a light tick, and that card
 * springs up from behind. Reduced motion swaps the card at once.
 */
export const useNextStepDeck = (count: number): NextStepDeckModel => {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const drag = useSharedValue(0);
  const enter = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const thrown = useRef(false);
  const offscreen = width * THROW_SCREENS;

  const advance = useCallback(() => {
    thrown.current = true;
    setIndex(value => value + 1);
    Vibration.vibrate(HAPTIC_TAP_MS);
  }, []);

  // After the swap commits: the thrown card (faded out off screen) comes back as the next one.
  useLayoutEffect(() => {
    if (!thrown.current) return;
    thrown.current = false;
    drag.value = 0;
    if (reduceMotion) return;
    enter.value = 1;
    enter.value = withSpring(0, motion.spring);
  }, [drag, enter, index, reduceMotion]);

  const throwCard = useCallback(
    (direction: number) => {
      'worklet';
      drag.value = withTiming(direction * offscreen, { duration: motion.duration.base }, done => {
        if (done) scheduleOnRN(advance);
      });
    },
    [advance, drag, offscreen],
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
          const isThrow =
            Math.abs(event.translationX) > THROW_DISTANCE ||
            Math.abs(event.velocityX) > THROW_VELOCITY;
          if (!isThrow) {
            drag.value = reduceMotion ? 0 : withSpring(0, motion.spring);
            return;
          }
          if (reduceMotion) {
            scheduleOnRN(advance);
            return;
          }
          throwCard(Math.sign(event.translationX || event.velocityX));
        }),
    [advance, count, drag, reduceMotion, throwCard],
  );

  const next = useCallback(() => {
    if (count < 2) return;
    if (reduceMotion) advance();
    else throwCard(-1);
  }, [advance, count, reduceMotion, throwCard]);

  // A refresh can shrink the deck under a deep index; wrap it back into range.
  return { gesture, drag, enter, index: count > 0 ? index % count : 0, next };
};
