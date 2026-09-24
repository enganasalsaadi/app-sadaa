import React from 'react';

import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';

import { useStyles, useTheme } from '@/core/theme';

import { percentageOfWidth } from '@/core/theme/utils/responsive';

import { Box, Pressable, Text } from '../primitives';

import {
  TAB_ANIMATION_CONFIG,
  WIDTH_CONFIG,
  INTERPOLATE_RANGE,
} from './constants';
import { tabItemStyles } from './styles';
import type { TabItemProps } from './types';

export const TabItem: React.FC<TabItemProps> = ({
  isActive,
  label,
  icon: Icon,
  onPress,
}) => {
  const { colors, spacing } = useTheme();
  const styles = useStyles(tabItemStyles);
  const expanded = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    expanded.value = withSpring(isActive ? 1 : 0, TAB_ANIMATION_CONFIG);
  }, [isActive, expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(
      expanded.value,
      INTERPOLATE_RANGE.input,
      INTERPOLATE_RANGE.output,
    )}%`,
    backgroundColor: interpolateColor(
      expanded.value,
      [0, 1],
      ['transparent', colors.interactive.main],
    ),
  }));

  return (
    <Pressable
      onPress={onPress}
      scaleOnPress={false}
      height="100%"
      justify="center"
      align="center"
      width={percentageOfWidth(
        isActive ? WIDTH_CONFIG.active : WIDTH_CONFIG.inactive,
      )}
    >
      <Animated.View style={[styles.tabBackground, animatedStyle]}>
        <Box row align="center" justify="center" px="sm">
          <Icon
            size={spacing.xl}
            color={isActive ? colors.text.onAccent : colors.text.secondary}
            strokeWidth={isActive ? 2 : 1.5}
          />
          {isActive && (
            <Text
              variant="bodySmall"
              color={colors.text.onAccent}
              ms="sm"
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
};
