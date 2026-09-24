import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';

interface SkeletonItemProps {
  /** 'list' renders a tall card; 'grid' renders a compact square card */
  variant?: 'list' | 'grid';
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({ variant = 'list' }) => {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  // Bones use the elevated (skeleton) tone on top of the plain surface card.
  const bg = colors.surface.elevated;
  const elevated = colors.surface.main;

  if (variant === 'grid') {
    return (
      <Animated.View style={[shimmerStyle, styles.flex]}>
        <Box flex={1} m="xs" borderRadius="lg" overflow="hidden" bg={elevated} shadow="sm">
          <Box height={110} bg={bg} />
          <Box p="sm" gap="xs">
            <Box height={13} width="80%" bg={bg} borderRadius="sm" />
            <Box height={11} width="55%" bg={bg} borderRadius="sm" />
            <Box height={15} width="40%" bg={bg} borderRadius="sm" mt="xs" />
          </Box>
        </Box>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={shimmerStyle}>
      <Box mb="md" borderRadius="lg" overflow="hidden" bg={elevated} shadow="sm">
        <Box height={180} bg={bg} />
        <Box p="lg" gap="sm">
          <Box height={18} width="70%" bg={bg} borderRadius="sm" />
          <Box height={14} width="45%" bg={bg} borderRadius="sm" />
          <Box height={12} width="60%" bg={bg} borderRadius="sm" />
          <Box row justify="space-between" pt="sm">
            <Box height={22} width="28%" bg={bg} borderRadius="sm" />
            <Box height={22} width="28%" bg={bg} borderRadius="sm" />
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
