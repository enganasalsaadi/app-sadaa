import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { SpacingToken } from '@/core/theme/types';
import { LAYOUT_DEFAULT_PADDING } from './resolveLayout';

interface LayoutContextValue {
  /** Horizontal padding of the screen content, so the footer lines up with it. */
  paddingX: SpacingToken;
  /** The body's scroll offset; `null` in `static` mode (nothing scrolls). */
  scrollY: SharedValue<number> | null;
  viewportHeight: SharedValue<number> | null;
}

export const LayoutContext = createContext<LayoutContextValue>({
  paddingX: LAYOUT_DEFAULT_PADDING.x,
  scrollY: null,
  viewportHeight: null,
});

export const useLayoutContext = (): LayoutContextValue => useContext(LayoutContext);
