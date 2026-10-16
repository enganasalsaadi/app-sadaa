import React, { useCallback, useState } from 'react';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useKeyboardVisible } from '@/core/hooks';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives';
import {
  BAR_CORNER,
  BAR_HEIGHT,
  IOS_INSET_SHARE,
  SHADOW_BLUR,
  SHADOW_OFFSET_Y,
} from './constants';
import { MainTabItem } from './MainTabItem';
import { TabRail } from './TabRail';

export interface MainTabBarProps extends BottomTabBarProps {
  /** False on a tab's inner screens: the bar unmounts and the screen takes its room. */
  visible: boolean;
}

/**
 * Docked tab bar (approved 2026-10-16): a surface slab with rounded top corners, in the
 * navigator's flow, so screens end above it and nothing ever scrolls behind it. The page colour
 * (navigator background) shows past its corners. An elastic teal rail on the top edge marks the
 * active tab; the active icon sits in a teal squircle.
 *
 * Bottom padding: part of the iOS home-indicator inset (the full 34pt reads as an empty band),
 * the full Android inset (a 3-button nav bar needs all of it), a small gap where there is none.
 * Hidden while the Android keyboard is up, which would otherwise lift it above the keys.
 *
 * Label, icon and count come from each screen's `title` / `tabBarIcon` / numeric `tabBarBadge`.
 */
export const MainTabBar: React.FC<MainTabBarProps> = ({
  state,
  descriptors,
  navigation,
  visible,
}) => {
  const { colors, sizes, spacing } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const keyboardUp = useKeyboardVisible();
  const [reach, setReach] = useState<number | null>(null);

  const styles = useStyles(
    ({ colors: palette, spacing: space }): Record<'bar' | 'row', ViewStyle> => {
      const { tabBar } = palette.navigation;
      const inset = Platform.OS === 'ios' ? Math.round(bottom * IOS_INSET_SHARE) : bottom;
      return {
        bar: {
          paddingBottom: Math.max(inset, space.sm),
          backgroundColor: tabBar.background,
          borderTopStartRadius: BAR_CORNER,
          borderTopEndRadius: BAR_CORNER,
          // A 1px rim (dark: the edge against the page) under a soft lift, both following the corners.
          boxShadow: [
            { offsetX: 0, offsetY: -1, blurRadius: 0, color: tabBar.rim },
            { offsetX: 0, offsetY: SHADOW_OFFSET_Y, blurRadius: SHADOW_BLUR, color: tabBar.shadow },
          ],
        },
        row: { flexDirection: 'row', height: BAR_HEIGHT, paddingHorizontal: space.sm ,paddingTop:moderateScale(8)},
      };
    },
    [bottom],
  );

  const onPress = useCallback(
    (index: number) => {
      const route = state.routes[index];
      if (!route) return;
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name);
    },
    [navigation, state.index, state.routes],
  );
  const onPressIn = useCallback((index: number) => setReach(index), []);
  const onPressOut = useCallback(() => setReach(null), []);

  if (!visible || (Platform.OS === 'android' && keyboardUp)) return null;

  return (
    <Box style={styles.bar}>
      <Box style={styles.row} accessibilityRole="tablist">
        <TabRail
          index={state.index}
          reach={reach}
          count={state.routes.length}
          width={width}
          inset={spacing.sm}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] ?? {};
          const isFocused = state.index === index;
          return (
            <MainTabItem
              key={route.key}
              index={index}
              isActive={isFocused}
              label={options?.title ?? route.name}
              badge={typeof options?.tabBarBadge === 'number' ? options.tabBarBadge : 0}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              icon={options?.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? colors.navigation.tabBar.active : colors.navigation.tabBar.inactive,
                size: sizes.icon.md,
              })}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            />
          );
        })}
      </Box>
    </Box>
  );
};
