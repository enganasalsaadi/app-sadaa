import React, { createContext, useContext, useCallback } from 'react';
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export const SCROLL_DIRECTION_THRESHOLD = 8;

interface ScrollContextValue {
  scrollY: SharedValue<number>;
  /** 1 = scrolling up / at top (bar visible), -1 = scrolling down (bar hidden) */
  scrollDirection: SharedValue<1 | -1>;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollY = useSharedValue(0);
  const scrollDirection = useSharedValue<1 | -1>(1);

  return (
    <ScrollContext.Provider value={{ scrollY, scrollDirection }}>
      {children}
    </ScrollContext.Provider>
  );
};

/** Returns null when used outside <ScrollProvider> — always null-check before use. */
export const useScrollContext = (): ScrollContextValue | null =>
  useContext(ScrollContext);

/**
 * Returns a Reanimated worklet scroll handler for use with Animated components
 * (e.g. Animated.ScrollView in Layout). NOT compatible with FlashList — use
 * useJSScrollHandler instead.
 */
export const useScrollHandler = () => {
  const scrollCtx = useScrollContext();
  const ctxScrollY = scrollCtx?.scrollY;
  const ctxScrollDir = scrollCtx?.scrollDirection;

  return useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      if (ctxScrollY === undefined || ctxScrollDir === undefined) return;
      const y = event.contentOffset.y;
      const diff = y - ctxScrollY.value;
      if (Math.abs(diff) > SCROLL_DIRECTION_THRESHOLD) {
        ctxScrollDir.value = diff > 0 ? -1 : 1;
      }
      ctxScrollY.value = y;
    },
  });
};

/**
 * Returns a plain JS scroll handler for non-Animated components (FlashList / SuperList).
 * In Reanimated v4, SharedValue.value assignments from JS automatically run on the UI
 * thread, so no runOnUI bridge is needed.
 */
export const useJSScrollHandler = () => {
  const scrollCtx = useScrollContext();

  return useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollCtx) return;
      const y = event.nativeEvent.contentOffset.y;
      const diff = y - scrollCtx.scrollY.value;
      if (Math.abs(diff) > SCROLL_DIRECTION_THRESHOLD) {
        scrollCtx.scrollDirection.value = diff > 0 ? -1 : 1;
      }
      scrollCtx.scrollY.value = y;
    },
    [scrollCtx],
  );
};
