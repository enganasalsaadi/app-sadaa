import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** True while the software keyboard is shown. */
export const useKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // `will*` fires in sync with the keyboard animation on iOS; Android only has `did*`.
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subs = [
      Keyboard.addListener(show, () => setVisible(true)),
      Keyboard.addListener(hide, () => setVisible(false)),
    ];
    return () => subs.forEach(sub => sub.remove());
  }, []);
  return visible;
};
