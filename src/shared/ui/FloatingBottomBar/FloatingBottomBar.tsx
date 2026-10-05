import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { motion, useTheme } from '@/core/theme';
import { useScrollContext } from '@/shared/context/ScrollContext';
import { useBottomBar } from '@/shared/context/BottomBarContext';
import { Box } from '../primitives';
import { BAR_CORNER, BAR_HEIGHT, SCROLL_TOP_THRESHOLD } from './constants';
import { GlassBarBackground } from './GlassBarBackground';
import { TabItem } from './TabItem';

/**
 * Floating navy liquid-glass capsule (rule 08, approved 2026-10-06). Content scrolls
 * behind it and shows through the blur; it slides away on scroll-down and
 * returns on scroll-up. Label and icon come from each screen's `title` /
 * `tabBarIcon` options, so the navigator owns the role-specific tab set.
 * Inner screens remove it with `useHideBottomBar()`.
 */
export const FloatingBottomBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, spacing, sizes } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollCtx = useScrollContext();
  const { visible } = useBottomBar();

  const barWidth = screenWidth - spacing.lg * 2;
  // Bar + its bottom margin + room for the md shadow bleed, so hiding clears it fully.
  const hiddenOffset = BAR_HEIGHT + spacing.sm + spacing.lg + bottom;

  // Destructure before worklet capture
  const ctxScrollY = scrollCtx?.scrollY;
  const ctxScrollDir = scrollCtx?.scrollDirection;

  // Shared value so the worklet can read JS-driven visibility
  const isVisible = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    isVisible.value = visible ? 1 : 0;
  }, [visible, isVisible]);

  const slideTarget = useDerivedValue(() => {
    'worklet';
    if (isVisible.value === 0) return hiddenOffset;
    if (ctxScrollY === undefined || ctxScrollDir === undefined) return 0;
    if (ctxScrollY.value < SCROLL_TOP_THRESHOLD) return 0;
    return ctxScrollDir.value === -1 ? hiddenOffset : 0;
  });

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideTarget.value, motion.spring) }],
  }));

  return (
    <Animated.View
      style={[styles.container, { paddingBottom: bottom }, slideStyle]}
      pointerEvents="box-none"
    >
      <Box width={barWidth} height={BAR_HEIGHT} mb="sm">
        <GlassBarBackground
          width={barWidth}
          height={BAR_HEIGHT}
          corner={BAR_CORNER}
        />
        <Box
          row
          align="center"
          accessibilityRole="tablist"
          style={StyleSheet.absoluteFill}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] ?? {};
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                isActive={isFocused}
                label={options?.title ?? route.name}
                icon={options?.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused
                    ? colors.navigation.tabBar.active
                    : colors.navigation.tabBar.inactive,
                  size: sizes.icon.md,
                })}
                onPress={onPress}
              />
            );
          })}
        </Box>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    alignItems: 'center',
  },
});
