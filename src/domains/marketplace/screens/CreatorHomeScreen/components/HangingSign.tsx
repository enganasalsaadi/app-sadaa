import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  type ExitAnimationsValues,
  type LayoutAnimation,
} from 'react-native-reanimated';
import {
  CircleAlert,
  Clock,
  Lock,
  ShieldAlert,
  Tag,
  type LucideIcon,
} from 'lucide-react-native';
import { motion, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text, useLayoutInView, useLoopClock } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import type { HomeNoticeKey } from '../utils/resolveHomeNotice';

type HomeNotice = NonNullable<CreatorHomeScreenModel['notice']>;

/** Widest sway either side, degrees: felt, not watched. */
const SWING_DEG = 2;
/** How far the sign drops and turns as it falls away once the blocker is gone. */
const FALL_TURN_DEG = 9;

const NOTICE_ICON = {
  platformsActionRequired: CircleAlert,
  kycRejected: ShieldAlert,
  rateCardRequired: Tag,
  platformsUnderReview: Clock,
  kitHidden: Lock,
} as const satisfies Record<HomeNoticeKey, LucideIcon>;

/** The sign comes unhooked: it tips, drops past the pass and fades. */
const fallAway = (values: ExitAnimationsValues): LayoutAnimation => {
  'worklet';
  const timing = { duration: motion.duration.slow };
  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }, { rotate: '0deg' }] },
    animations: {
      opacity: withTiming(0, timing),
      transform: [
        { translateY: withTiming(values.currentHeight, timing) },
        { rotate: withTiming(`${FALL_TURN_DEG}deg`, timing) },
      ],
    },
  };
};

interface HangingSignProps {
  notice: HomeNotice;
  /** Short screens: title and action only. */
  compact: boolean;
}

/**
 * The one blocker as a sign hung from the pass on two strings, swaying slowly while it
 * waits (paused off screen and under reduced motion). Its top edge carries the status
 * tone; the icon says which blocker it is. When the blocker clears, the sign falls away.
 */
const HangingSignComponent: React.FC<HangingSignProps> = ({ notice, compact }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { ref, onLayout, visible } = useLayoutInView({ track: true });
  const clock = useLoopClock(motion.loop.signSwing, visible && !reduceMotion);
  const hue = resolveHue(colors, notice.tone);
  const Icon = NOTICE_ICON[notice.key];

  const styles = useStyles(
    ({ borderWidths, radii, shadows, spacing }): Record<'strings' | 'string' | 'stringEnd' | 'board', ViewStyle> => {
      const string: ViewStyle = {
        width: borderWidths.md,
        height: spacing['2xl'],
        backgroundColor: colors.storefront.string,
        transform: [{ rotate: '-8deg' }],
      };
      return {
        // The strings start just under the pass, a third of the way in from each side.
        strings: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '30%' },
        string,
        stringEnd: { ...string, transform: [{ rotate: '8deg' }] },
        board: {
          backgroundColor: colors.surface.main,
          borderRadius: radii.lg,
          borderTopWidth: borderWidths.xl,
          borderTopColor: hue.main,
          padding: spacing.lg,
          gap: spacing.sm,
          ...shadows.lg,
        },
      };
    },
    [colors.storefront.string, colors.surface.main, hue.main],
  );

  const sway = useAnimatedStyle(() => ({
    transformOrigin: 'top',
    transform: [{ rotate: `${Math.sin(clock.value * Math.PI * 2) * SWING_DEG}deg` }],
  }));

  return (
    <Animated.View
      ref={ref}
      onLayout={onLayout}
      entering={reduceMotion ? undefined : FadeInUp.springify()}
      exiting={reduceMotion ? undefined : fallAway}
    >
      <Animated.View style={sway}>
        <Box style={styles.strings} pointerEvents="none">
          <Box style={styles.string} />
          <Box style={styles.stringEnd} />
        </Box>
        <Box style={styles.board} mx="lg" accessibilityRole="summary" accessibilityLiveRegion="polite">
          <Box row align="center" gap="sm">
            <Icon size={sizes.icon.sm} color={hue.main} />
            <Box flex={1}>
              <Text variant="bodyMedium" color={hue.text} numberOfLines={2}>
                {notice.title}
              </Text>
            </Box>
          </Box>
          {compact ? null : (
            <Text variant="bodySmall" color={colors.text.secondary}>
              {notice.message}
            </Text>
          )}
          {notice.action ? (
            <Box alignSelf="flex-start" pt="xs">
              <CustomButton
                title={notice.action.label}
                size="sm"
                onPress={notice.action.onPress}
                loading={notice.action.busy}
              />
            </Box>
          ) : null}
        </Box>
      </Animated.View>
    </Animated.View>
  );
};

export const HangingSign = memo(HangingSignComponent);
