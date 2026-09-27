import { createContext, useContext } from 'react';
import type { SpacingToken } from '@/core/theme/types';
import { LAYOUT_DEFAULT_PADDING } from './resolveLayout';

interface LayoutContextValue {
  /** Horizontal padding of the screen content, so the footer lines up with it. */
  paddingX: SpacingToken;
}

export const LayoutContext = createContext<LayoutContextValue>({
  paddingX: LAYOUT_DEFAULT_PADDING.x,
});

export const useLayoutContext = (): LayoutContextValue => useContext(LayoutContext);
