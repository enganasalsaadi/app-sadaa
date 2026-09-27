import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export const SCROLL_DIRECTION_THRESHOLD = 8;

export interface ScrollContextValue {
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
  const value = useMemo(() => ({ scrollY, scrollDirection }), [scrollY, scrollDirection]);

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

/** Returns null when used outside <ScrollProvider> — always null-check before use. */
export const useScrollContext = (): ScrollContextValue | null =>
  useContext(ScrollContext);

/** Writes a new offset into the app-wide scroll state (direction + position). JS or UI thread. */
export const publishScrollOffset = (ctx: ScrollContextValue, y: number) => {
  'worklet';
  const diff = y - ctx.scrollY.value;
  if (Math.abs(diff) > SCROLL_DIRECTION_THRESHOLD) {
    ctx.scrollDirection.value = diff > 0 ? -1 : 1;
  }
  ctx.scrollY.value = y;
};

/**
 * Returns a Reanimated worklet scroll handler for use with Animated components
 * (e.g. Animated.ScrollView in Layout). NOT compatible with FlashList — use
 * useJSScrollHandler instead.
 */
export const useScrollHandler = () => {
  const scrollCtx = useScrollContext();

  return useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      if (scrollCtx) publishScrollOffset(scrollCtx, event.contentOffset.y);
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
      if (scrollCtx) publishScrollOffset(scrollCtx, event.nativeEvent.contentOffset.y);
    },
    [scrollCtx],
  );
};
