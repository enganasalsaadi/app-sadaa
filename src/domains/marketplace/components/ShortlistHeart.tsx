import React, { memo, useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react-native';
import { iconStroke, motion, useTheme } from '@/core/theme';
import { Pressable } from '@/shared/ui';

/** How far the heart swells when a creator is saved, before springing back. */
const POP_SCALE = 1.35;

export interface ShortlistHeartProps {
  selected: boolean;
  onToggle: () => void;
}

/**
 * ❤️ shortlist toggle (44pt). Saving pops the heart once and fills it teal (selected, rule 08);
 * removing just empties it. The list underneath updates optimistically, so the pop is instant.
 */
const ShortlistHeartComponent: React.FC<ShortlistHeartProps> = ({ selected, onToggle }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const onPress = useCallback(() => {
    if (!selected && !reduceMotion) {
      scale.value = withSequence(
        withSpring(POP_SCALE, motion.spring),
        withSpring(1, motion.spring),
      );
    }
    onToggle();
  }, [onToggle, reduceMotion, scale, selected]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = selected ? colors.interactive.main : colors.icon.secondary;

  return (
    <Pressable
      onPress={onPress}
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      align="center"
      justify="center"
      hitSlop={sizes.hitSlop.sm}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={t(
        selected ? 'marketplace.shortlist.remove' : 'marketplace.shortlist.add',
      )}
    >
      <Animated.View style={popStyle}>
        <Heart
          size={sizes.icon.sm}
          color={color}
          fill={selected ? color : colors.layout.transparent}
          strokeWidth={iconStroke.regular}
        />
      </Animated.View>
    </Pressable>
  );
};

export const ShortlistHeart = memo(ShortlistHeartComponent);
