import { useWindowDimensions } from 'react-native';
import { COMPACT_HERO_MAX_HEIGHT } from '@/core/config';
import { useKeyboardVisible } from '@/core/hooks';

/**
 * True when a HeroSheet header should use its compact layout: while the
 * keyboard is open, and always on short screens. Call it inside the header
 * component so only the hero re-renders on keyboard show/hide.
 */
export const useHeroCompact = (): boolean => {
  const keyboardVisible = useKeyboardVisible();
  const { height } = useWindowDimensions();
  return keyboardVisible || height < COMPACT_HERO_MAX_HEIGHT;
};
