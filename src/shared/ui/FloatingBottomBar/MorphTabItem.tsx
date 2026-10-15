import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '../primitives';
import { MORPH_ACTIVE_GROW, MORPH_LABEL_MAX } from './constants';
import { TabBadge } from './TabBadge';

interface MorphTabItemProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  /** Amber count on the icon; 0 = none. */
  badge: number;
  /** Spoken label (the count included); defaults to `label`. */
  accessibilityLabel?: string;
  onPress: () => void;
}

/**
 * Morph bar tab: icon only at rest; the active one springs wider and shows its teal capsule and
 * label beside the icon. Instant under reduced motion.
 *
 * Capsule and label are plain views: both an animated opacity and `entering` layout animations
 * left them at opacity 0 on device, so only the width springs.
 */
const MorphTabItemComponent: React.FC<MorphTabItemProps> = ({
  isActive,
  label,
  icon,
  badge,
  accessibilityLabel,
  onPress,
}) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    const target = isActive ? 1 : 0;
    progress.value = reduceMotion ? target : withSpring(target, motion.lensSpring);
  }, [isActive, progress, reduceMotion]);

  const styles = useStyles(({ colors: palette, radii, spacing }) => ({
    // The bar row centres its children, so without stretch the slot collapses to the icon height.
    slot: { flexDirection: 'row' as const, alignSelf: 'stretch' as const },
    pill: {
      ...StyleSheet.absoluteFill,
      borderRadius: radii.full,
      backgroundColor: palette.navigation.tabBar.activePill,
    },
    // No flexShrink: the label is measured before the width spring settles and shrank to 0 there.
    label: { maxWidth: MORPH_LABEL_MAX, marginStart: spacing.sm },
  }), []);

  const slotStyle = useAnimatedStyle(() => ({ flex: 1 + progress.value * MORPH_ACTIVE_GROW }));

  return (
    <Animated.View style={[styles.slot, slotStyle]}>
      <Pressable
        flex={1}
        row
        align="center"
        justify="center"
        onPress={onPress}
        scaleOnPress
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {isActive ? <Box style={styles.pill} pointerEvents="none" /> : null}
        <Box>
          {icon}
          <TabBadge count={badge} />
        </Box>
        {isActive ? (
          <Text
            variant="buttonSmall"
            numberOfLines={1}
            color={colors.navigation.tabBar.active}
            style={styles.label}
          >
            {label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

export const MorphTabItem = memo(MorphTabItemComponent);
