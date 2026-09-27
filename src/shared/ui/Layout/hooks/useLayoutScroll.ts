import { useCallback, useContext, useEffect } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { NavigationContext } from '@react-navigation/native';
import { publishScrollOffset, useScrollContext } from '@/shared/context/ScrollContext';

/**
 * Per-screen scroll state. The app-wide `ScrollContext` (bottom-bar auto-hide) is
 * shared by every mounted screen, so this screen's offset is handed back to it on
 * focus instead of leaking the previous screen's value.
 */
export const useLayoutScroll = () => {
  const appScroll = useScrollContext();
  const navigation = useContext(NavigationContext);
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const viewportHeight = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      if (appScroll) publishScrollOffset(appScroll, event.contentOffset.y);
    },
  });

  useEffect(() => {
    if (!appScroll) return undefined;
    const sync = () => {
      appScroll.scrollY.value = scrollY.value;
      appScroll.scrollDirection.value = 1;
    };
    sync();
    return navigation?.addListener('focus', sync);
  }, [appScroll, navigation, scrollY]);

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.value = height;
    },
    [contentHeight],
  );

  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportHeight.value = event.nativeEvent.layout.height;
    },
    [viewportHeight],
  );

  return { scrollY, contentHeight, viewportHeight, onScroll, onContentSizeChange, onViewportLayout };
};

export type LayoutScrollState = ReturnType<typeof useLayoutScroll>;
