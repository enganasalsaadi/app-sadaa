import type React from 'react';
import { useRef, useCallback } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { MMKV_IDS } from '@/core/storage';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const _mmkv = createMMKV({ id: MMKV_IDS.APP });
const PREFIX = 'superlist.scroll.';

export interface UseScrollRestorationReturn {
  onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onListLayout: () => void;
  clearRestoration: () => void;
}

/** Minimal surface of a scrollable list ref (FlashList, FlatList, ScrollView-like). */
export interface ScrollableListHandle {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
}

export const useScrollRestoration = (
  key: string | undefined,
  listRef: React.RefObject<ScrollableListHandle | null>,
): UseScrollRestorationReturn => {
  const hasRestored = useRef(false);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!key) return;
      _mmkv.set(`${PREFIX}${key}`, event.nativeEvent.contentOffset.y);
    },
    [key],
  );

  const onListLayout = useCallback(() => {
    if (hasRestored.current || !key) return;
    hasRestored.current = true;
    const saved = _mmkv.getNumber(`${PREFIX}${key}`);
    if (saved && saved > 0) {
      // Small delay to let FlashList finish its first layout pass
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: saved, animated: false });
      }, 100);
    }
  }, [key, listRef]);

  const clearRestoration = useCallback(() => {
    if (!key) return;
    _mmkv.set(`${PREFIX}${key}`, 0);
    hasRestored.current = false;
  }, [key]);

  return { onScrollEnd, onListLayout, clearRestoration };
};
