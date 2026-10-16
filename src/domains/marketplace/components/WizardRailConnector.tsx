import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const CONNECTOR = moderateScale(2);

interface WizardRailConnectorProps {
  filled: boolean;
  /** The line leading into the step that just opened: it draws in on mount. */
  draws: boolean;
}

/** The line between two stops of the step rail; it fills teal as the wizard moves past it. */
const WizardRailConnectorComponent: React.FC<WizardRailConnectorProps> = ({ filled, draws }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(filled && (!draws || reduceMotion) ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      fill.value = filled ? 1 : 0;
      return;
    }
    fill.value = withTiming(filled ? 1 : 0, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [filled, fill, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const styles = useStyles(
    ({ radii, spacing }): Record<'track' | 'fill', ViewStyle> => ({
      track: {
        flex: 1,
        height: CONNECTOR,
        marginHorizontal: spacing.xs,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.glass.border,
      },
      fill: { height: '100%', backgroundColor: colors.glass.iconInteractive },
    }),
    [colors.glass.border, colors.glass.iconInteractive],
  );
  return (
    <Box style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </Box>
  );
};

export const WizardRailConnector = memo(WizardRailConnectorComponent);
