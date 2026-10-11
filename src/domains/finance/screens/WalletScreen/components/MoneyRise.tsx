import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ChevronsUp } from 'lucide-react-native';
import { motion, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const BADGE = moderateScale(30);
/** How far the chevrons travel inside the badge, each way from its centre. */
const TRAVEL = moderateScale(7);

export interface MoneyRiseProps {
  /** `money`: rising into the creator's wallet · `neutral`: on its way to the creator (brand). */
  tone: 'money' | 'neutral';
  /** On screen and the tab focused: the loop runs only then. */
  active: boolean;
}

/**
 * Chevrons rising through a small disc and fading out at its top: this money is climbing
 * toward a wallet and lands soon. Decorative (the hint beside it says when). Rests off
 * screen and while the tab is out of focus; reduced motion leaves the chevrons still.
 */
const MoneyRiseComponent: React.FC<MoneyRiseProps> = ({ tone, active }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const rise = useSharedValue(0.5);
  const moving = active && !reduceMotion;

  useEffect(() => {
    if (!moving) {
      cancelAnimation(rise);
      rise.value = 0.5;
      return undefined;
    }
    rise.value = 0;
    rise.value = withRepeat(withTiming(1, { duration: motion.loop.moneyRise, easing: Easing.inOut(Easing.quad) }), -1, false);
    return () => cancelAnimation(rise);
  }, [moving, rise]);

  const chevronStyle = useAnimatedStyle(() => ({
    opacity: moving ? interpolate(rise.value, [0, 0.3, 0.7, 1], [0, 1, 1, 0]) : 1,
    transform: [{ translateY: interpolate(rise.value, [0, 1], [TRAVEL, -TRAVEL]) }],
  }));
  const styles = useStyles(
    (): Record<'badge', ViewStyle> => ({ badge: { width: BADGE, height: BADGE, overflow: 'hidden' } }),
    [],
  );

  const fill = tone === 'money' ? colors.money.soft : colors.surface.elevated;
  const ink = tone === 'money' ? colors.money.main : colors.icon.secondary;

  return (
    <Box style={styles.badge} borderRadius="full" bg={fill} align="center" justify="center" importantForAccessibility="no-hide-descendants">
      <Animated.View style={chevronStyle}>
        <ChevronsUp size={sizes.icon.sm} color={ink} />
      </Animated.View>
    </Box>
  );
};

export const MoneyRise = memo(MoneyRiseComponent);
