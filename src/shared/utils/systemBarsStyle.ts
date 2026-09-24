import type { SystemBarStyle } from 'react-native-edge-to-edge';

/** Maps app status intent to `react-native-edge-to-edge` `SystemBars` styles (icon contrast). */
export function layoutStatusBarToSystemBarStyle(
  statusBarStyle: 'auto' | 'light' | 'dark',
  isDark: boolean,
): SystemBarStyle {
  if (statusBarStyle === 'auto') {
    return isDark ? 'light' : 'dark';
  }
  return statusBarStyle === 'light' ? 'light' : 'dark';
}
