import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check, type LucideIcon } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

const NODE = moderateScale(36);
/** Upper bound for the current step's label + badge; the capsule opens up to its natural width. */
const LABEL_MAX = moderateScale(160);

/** `missing` = a step left behind that still lacks something the campaign needs. */
export type WizardRailState = 'done' | 'now' | 'todo' | 'missing';

export interface WizardRailStep<K extends string> {
  key: K;
  label: string;
  icon: LucideIcon;
  state: WizardRailState;
  /** Whether a tap moves to this step. */
  tappable: boolean;
  a11yLabel: string;
}

interface WizardRailStopProps<K extends string> {
  step: WizardRailStep<K>;
  /** «2/4» on the current step's capsule. */
  position: string;
  onPress: (key: K) => void;
}

/**
 * One stop on the rail. Upcoming = outline circle with the step's own icon, done = teal circle with
 * a check, missing = outline in the warning tone, current = white capsule that opens to show icon,
 * name and position.
 */
const WizardRailStopComponent = <K extends string>({ step, position, onPress }: WizardRailStopProps<K>) => {
  const { colors, sizes, shadows } = useTheme();
  const reduceMotion = useReducedMotion();
  const { state } = step;
  const done = state === 'done';
  const now = state === 'now';
  const missing = state === 'missing';
  const Icon = done ? Check : step.icon;

  const open = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!now || reduceMotion) return;
    open.value = withTiming(1, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [now, open, reduceMotion]);
  const revealStyle = useAnimatedStyle(() => ({ maxWidth: open.value * LABEL_MAX, opacity: open.value }));

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'node' | 'capsule' | 'reveal' | 'badge', ViewStyle> => ({
      node: {
        width: NODE,
        height: NODE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: borderWidths.sm,
        borderColor: done
          ? colors.glass.iconInteractive
          : missing
            ? colors.glass.iconWarning
            : colors.glass.border,
        backgroundColor: done ? colors.glass.iconInteractive : undefined,
      },
      // Icon keeps the circle's centre at the start edge, so the capsule reads as the circle growing.
      capsule: {
        height: NODE,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radii.full,
        paddingStart: (NODE - sizes.icon.sm) / 2,
        paddingEnd: spacing.xs,
        backgroundColor: colors.text.onBrand,
        ...shadows.md,
      },
      reveal: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
      badge: {
        marginStart: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.full,
        backgroundColor: colors.brand.soft,
      },
    }),
    [colors.brand.soft, colors.glass, colors.text.onBrand, done, missing, shadows.md, sizes.icon.sm],
  );

  if (now) {
    return (
      <Box
        style={styles.capsule}
        accessible
        accessibilityRole="header"
        accessibilityState={{ selected: true }}
        accessibilityLabel={step.a11yLabel}
      >
        <Icon size={sizes.icon.sm} color={colors.brand.main} />
        <Animated.View style={[styles.reveal, revealStyle]}>
          <Text variant="label" color={colors.brand.main} numberOfLines={1} ms="sm">
            {step.label}
          </Text>
          <Box style={styles.badge}>
            <Text variant="caption" color={colors.brand.text}>
              {position}
            </Text>
          </Box>
        </Animated.View>
      </Box>
    );
  }

  return (
    <Pressable
      style={styles.node}
      disabled={!step.tappable}
      onPress={() => onPress(step.key)}
      hitSlop={sizes.hitSlop.sm}
      accessibilityRole="button"
      accessibilityState={{ disabled: !step.tappable }}
      accessibilityLabel={step.a11yLabel}
    >
      <Icon
        size={sizes.icon.sm}
        color={
          done
            ? colors.glass.onIconInteractive
            : missing
              ? colors.glass.iconWarning
              : colors.text.onBrandMuted
        }
        strokeWidth={done ? 3 : 2}
      />
    </Pressable>
  );
};

export const WizardRailStop = memo(WizardRailStopComponent) as typeof WizardRailStopComponent;
