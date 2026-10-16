import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type {
  DealsStackParamList,
  HomeStackParamList,
  SettingsStackParamList,
  WalletStackParamList,
} from '@/core/navigation';

type TabRootScreen =
  | keyof HomeStackParamList
  | keyof DealsStackParamList
  | keyof WalletStackParamList
  | keyof SettingsStackParamList;

/** The main screen of each tab stack, both roles: the only screens that show the bottom bar. */
const TAB_ROOT_SCREENS: ReadonlySet<string> = new Set<TabRootScreen>([
  'BrandHomeScreen',
  'CreatorHomeScreen',
  'Deals',
  'WalletScreen',
  'ProfileScreen',
]);

type TabRoute = Parameters<typeof getFocusedRouteNameFromRoute>[0];

/**
 * True while a tab shows its main screen: its stack has not mounted yet, the tab has no stack
 * (Messages), or the focused screen is the stack's main one. Checked by name, not stack depth,
 * because a deep link can open a stack straight on a detail screen.
 */
export const isOnTabRoot = (route: TabRoute): boolean => {
  const focused = getFocusedRouteNameFromRoute(route);
  return focused === undefined || TAB_ROOT_SCREENS.has(focused);
};
