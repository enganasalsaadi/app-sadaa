import React, { useMemo } from 'react';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabScreenInsetsProps {
  /** The tab bar sits under this screen and already pads the bottom inset. */
  docked: boolean;
  children: React.ReactNode;
}

/**
 * Gives a tab's screens a zero bottom inset while the docked bar is under them, so Layout and
 * footers don't pad the home indicator a second time above the bar. Inner screens (bar hidden)
 * keep the real inset.
 */
export const TabScreenInsets: React.FC<TabScreenInsetsProps> = ({ docked, children }) => {
  const insets = useSafeAreaInsets();
  const value = useMemo(() => (docked ? { ...insets, bottom: 0 } : insets), [docked, insets]);
  return <SafeAreaInsetsContext.Provider value={value}>{children}</SafeAreaInsetsContext.Provider>;
};
