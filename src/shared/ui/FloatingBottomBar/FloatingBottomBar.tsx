import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Settings } from 'lucide-react-native';
import { useTheme, moderateScale } from '@/core/theme';
import { useScrollContext } from '@/shared/context/ScrollContext';
import { useBottomBar } from '@/shared/context/BottomBarContext';
import { Box } from '../primitives';
import type { TabConfig } from '../BottomBar';
import { FLOATING_BAR_HEIGHT } from './constants';
import { CurvedBarBackground } from './CurvedBarBackground';
import { CurvedTabItem } from './CurvedTabItem';

const SPRING = { damping: 22, stiffness: 220 } as const;

/** Visual bar surface height (FAB overhangs above this). */
const BAR_HEIGHT = moderateScale(66);
/** Horizontal inset of the floating bar from the screen edges. */
const H_MARGIN = moderateScale(16);
/** Outer corner radius of the bar. */
const CORNER = moderateScale(26);

type TabLabelKey = 'tabs.home' | 'tabs.settings';

/** Per-tab visuals keyed by the tab navigator route name. */
const TAB_META: Record<
  string,
  { icon: TabConfig['icon']; labelKey: TabLabelKey } | undefined
> = {
  HomeTab: { icon: Home, labelKey: 'tabs.home' },
  SettingsTab: { icon: Settings, labelKey: 'tabs.settings' },
};

export const FloatingBottomBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollCtx = useScrollContext();
  const { visible } = useBottomBar();

  const barWidth = screenWidth - H_MARGIN * 2;

  // Destructure before worklet capture
  const ctxScrollY = scrollCtx?.scrollY;
  const ctxScrollDir = scrollCtx?.scrollDirection;

  // Shared value so the worklet can read JS-driven visibility
  const isVisible = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    isVisible.value = visible ? 1 : 0;
  }, [visible, isVisible]);

  // ── Scroll-aware + screen-driven slide ───────────────────────────────────
  const slideTarget = useDerivedValue(() => {
    'worklet';
    // Explicitly hidden by a screen — slide fully out of view
    if (isVisible.value === 0) return FLOATING_BAR_HEIGHT + bottom;
    if (ctxScrollY === undefined || ctxScrollDir === undefined) return 0;
    // Always visible when near the top
    if (ctxScrollY.value < 20) return 0;
    return ctxScrollDir.value === -1 ? FLOATING_BAR_HEIGHT + bottom : 0;
  });

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideTarget.value, SPRING) }],
  }));

  // ── Tabs derived from the navigator state ─────────────────────────────────
  const tabs: TabConfig[] = state.routes.map((route, index) => {
    const meta = TAB_META[route.name];
    const isFocused = state.index === index;

    return {
      id: index,
      label: meta ? t(meta.labelKey) : route.name,
      icon: meta?.icon ?? Home,
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      },
    };
  });

  const renderTab = (tab: TabConfig) => (
    <CurvedTabItem
      key={tab.id}
      isActive={state.index === tab.id}
      label={tab.label}
      icon={tab.icon}
      onPress={tab.onPress}
    />
  );

  return (
    <Animated.View
      style={[styles.container, { paddingBottom: bottom }, slideStyle]}
      pointerEvents="box-none"
    >
      <Box width={barWidth} height={BAR_HEIGHT} mb="sm" shadow="md">
        <CurvedBarBackground
          width={barWidth}
          height={BAR_HEIGHT}
          cradleRadius={0}
          corner={CORNER}
          fill={colors.surface.main}
          stroke={colors.border.strong}
        />
        <Box row align="center" style={StyleSheet.absoluteFill}>
          {tabs.map(renderTab)}
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

export default FloatingBottomBar;
