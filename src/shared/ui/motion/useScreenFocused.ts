import { useContext, useEffect, useState } from 'react';
import { NavigationContext } from '@react-navigation/native';

/**
 * Whether the screen around this view is focused; `true` outside navigation. Loops stop on
 * blur with it: tab roots stay mounted, and a blurred tab's animation still costs a frame.
 */
export const useScreenFocused = (): boolean => {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() !== false);

  useEffect(() => {
    if (!navigation) return undefined;
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);

  return focused;
};
