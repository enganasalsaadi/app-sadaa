import React, { memo, useCallback, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '../primitives';
import {
  ICON_HOP,
  ICON_HOP_DELAY,
  ICON_PRESS_SCALE,
  ICON_REST_LIFT,
  PILL_HEIGHT,
  PILL_RADIUS,
  PILL_WIDTH,
} from './constants';
import { TabBadge } from './TabBadge';

interface MainTabItemProps {
  index: number;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  /** Amber count on the icon; 0 = none. */
  badge: number;
  /** Spoken label (the count included); defaults to `label`. */
  accessibilityLabel?: string;
  onPress: (index: number) => void;
  /** Finger down / up: the rail reaches toward this tab before the press lands. */
  onPressIn: (index: number) => void;
  onPressOut: () => void;
}

/**
 * Stacked icon + label. The active one sits in a teal squircle that springs open, its icon hops
 * once when the tab opens; every icon dips while pressed. Instant under reduced motion.
 *
 * Only transforms animate: an animated opacity stayed at 0 on device in the earlier bar.
 */
const MainTabItemComponent: React.FC<MainTabItemProps> = ({
  index,
  isActive,
  label,
  icon,
  badge,
  accessibilityLabel,
  onPress,
  onPressIn,
  onPressOut,
}) => {
  const { colors } = useTheme();
  const { tabBar } = colors.navigation;
  const reduceMotion = useReducedMotion();
  const pill = useSharedValue(isActive ? 1 : 0);
  const lift = useSharedValue(isActive ? ICON_REST_LIFT : 0);
  const press = useSharedValue(1);
  const wasActive = useRef(isActive);

  useEffect(() => {
    if (wasActive.current === isActive) return;
    wasActive.current = isActive;
    if (reduceMotion) {
      pill.value = isActive ? 1 : 0;
      lift.value = isActive ? ICON_REST_LIFT : 0;
      return;
    }
    pill.value = withSpring(isActive ? 1 : 0, motion.spring);
    lift.value = isActive
      ? withDelay(
          ICON_HOP_DELAY,
          withSequence(
            withTiming(ICON_HOP, { duration: motion.duration.fast, easing: Easing.out(Easing.quad) }),
            withSpring(ICON_REST_LIFT, motion.spring),
          ),
        )
      : withSpring(0, motion.spring);
  }, [isActive, lift, pill, reduceMotion]);

  const styles = useStyles(
    (): Record<'slot' | 'pill', ViewStyle> => ({
      slot: { width: PILL_WIDTH, height: PILL_HEIGHT, alignItems: 'center', justifyContent: 'center' },
      pill: {
        position: 'absolute',
        top: 0,
        start: 0,
        width: PILL_WIDTH,
        height: PILL_HEIGHT,
        borderRadius: PILL_RADIUS,
        backgroundColor: tabBar.activeFill,
      },
    }),
    [tabBar.activeFill],
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 0.5 + pill.value * 0.5 }, { scaleY: pill.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: press.value }],
  }));

  const handlePress = useCallback(() => onPress(index), [index, onPress]);
  const handlePressIn = useCallback(() => {
    press.value = reduceMotion
      ? ICON_PRESS_SCALE
      : withTiming(ICON_PRESS_SCALE, { duration: motion.duration.fast });
    onPressIn(index);
  }, [index, onPressIn, press, reduceMotion]);
  const handlePressOut = useCallback(() => {
    press.value = reduceMotion ? 1 : withSpring(1, motion.spring);
    onPressOut();
  }, [onPressOut, press, reduceMotion]);

  return (
    <Pressable
      flex={1}
      align="center"
      justify="center"
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Box style={styles.slot}>
        <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
        <Animated.View style={iconStyle}>
          <Box>
            {icon}
            <TabBadge count={badge} />
          </Box>
        </Animated.View>
      </Box>
      <Text
        variant={isActive ? 'tabLabelActive' : 'tabLabel'}
        mt="xs"
        numberOfLines={1}
        color={isActive ? tabBar.activeLabel : tabBar.inactiveLabel}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const MainTabItem = memo(MainTabItemComponent);
