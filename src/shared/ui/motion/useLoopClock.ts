import { useEffect } from 'react';
import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

/**
 * One looping phase (0 → 1 every `periodMs`) on the UI thread, for scenes that derive all
 * their motion from a single clock (Skia stages, money paths, marquees). It only ticks
 * while `running`: pass false off screen, on blur and under reduced motion, and it resumes
 * from the same phase instead of jumping back to 0.
 */
export const useLoopClock = (periodMs: number, running: boolean): SharedValue<number> => {
  const clock = useSharedValue(0);
  const elapsed = useSharedValue(0);

  const frame = useFrameCallback(info => {
    elapsed.value += info.timeSincePreviousFrame ?? 0;
    clock.value = (elapsed.value % periodMs) / periodMs;
  }, false);

  useEffect(() => {
    frame.setActive(running);
    return () => frame.setActive(false);
  }, [frame, running]);

  return clock;
};
