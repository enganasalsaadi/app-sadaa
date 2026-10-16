import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, IconButton, Text, useLayoutScrollY } from '@/shared/ui';
import { WizardRailConnector } from './WizardRailConnector';
import { WizardRailStop, type WizardRailStep } from './WizardRailStop';

const ROW = moderateScale(52);
/** Equal start / end slots keep the centre content centred whatever the save label says. */
const SIDE = moderateScale(72);
/** Scroll distance over which the header lifts onto its shadow. */
const LIFT_DISTANCE = moderateScale(24);
/** Down-travel that tucks the top row away. */
const HIDE_TRAVEL = moderateScale(12);
/** Up-travel that brings it back: more than ROW, so the viewport growing by ROW on hide can't flip it. */
const SHOW_TRAVEL = ROW + moderateScale(16);

export interface WizardRailStrip {
  text: string;
  actionLabel: string;
  onAction: () => void;
}

interface WizardRailHeaderProps<K extends string> {
  steps: readonly WizardRailStep<K>[];
  /** Index of the current step; the rail's lines fill up to it. */
  current: number;
  /** The top row's middle (the creator, the campaign's name…). */
  center: React.ReactNode;
  /** The top row's end (the save state). */
  trailing: React.ReactNode;
  closeLabel: string;
  onClose: () => void;
  onStepPress: (key: K) => void;
  strip?: WizardRailStrip;
}

/**
 * Straight navy bar over a wizard, painted up behind the status bar. Top row: close, a centre slot,
 * a trailing slot. Below it the step rail, where the current step is a white capsule with its icon,
 * name and position. Scrolling down tucks the top row away so only the rail stays; scrolling back up
 * brings it back. An optional strip under the rail carries one blocker with its action.
 */
const WizardRailHeaderComponent = <K extends string>({
  steps,
  current,
  center,
  trailing,
  closeLabel,
  onClose,
  onStepPress,
  strip,
}: WizardRailHeaderProps<K>) => {
  const { colors, shadows } = useTheme();
  const { top } = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scrollY = useLayoutScrollY();
  const lifted = useDerivedValue(() =>
    scrollY ? interpolate(scrollY.value, [0, LIFT_DISTANCE], [0, 1], Extrapolation.CLAMP) : 0,
  );

  // Direction-driven: anchor = turning point of the current direction; travel past it flips the row.
  const tucked = useSharedValue(false);
  const anchor = useSharedValue(0);
  const tuck = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY?.value ?? 0,
    y => {
      const next = (hide: boolean) => {
        tucked.value = hide;
        anchor.value = y;
        tuck.value = reduceMotion
          ? Number(hide)
          : withTiming(Number(hide), { duration: motion.duration.base, easing: Easing.out(Easing.cubic) });
      };
      if (y <= ROW) {
        if (tucked.value) next(false);
        anchor.value = y;
      } else if (tucked.value) {
        if (y > anchor.value) anchor.value = y;
        else if (anchor.value - y > SHOW_TRAVEL) next(false);
      } else if (y < anchor.value) {
        anchor.value = y;
      } else if (y - anchor.value > HIDE_TRAVEL) {
        next(true);
      }
    },
    [reduceMotion],
  );
  const topRowStyle = useAnimatedStyle(() => ({ height: ROW * (1 - tuck.value), opacity: 1 - tuck.value }));

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'shell' | 'clip' | 'topRow' | 'row' | 'side' | 'strip', ViewStyle> => ({
      shell: {
        backgroundColor: colors.brand.main,
        borderBottomWidth: borderWidths.thin,
        borderBottomColor: colors.glass.hairline,
        shadowColor: shadows.lg.shadowColor,
        shadowOffset: shadows.lg.shadowOffset,
        shadowRadius: shadows.lg.shadowRadius,
      },
      // Padding sits on this view, never on the gradient: a padded gradient clips to its content box.
      clip: { overflow: 'hidden', paddingTop: top },
      topRow: { overflow: 'hidden' },
      row: { height: ROW, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
      side: { width: SIDE },
      strip: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
        paddingStart: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
    }),
    [colors.brand.main, colors.glass, shadows.lg, top],
  );

  const liftOpacity = shadows.lg.shadowOpacity ?? 0;
  const liftElevation = shadows.lg.elevation ?? 0;
  const liftStyle = useAnimatedStyle(() => ({
    shadowOpacity: lifted.value * liftOpacity,
    elevation: lifted.value * liftElevation,
  }));

  return (
    <Animated.View style={[styles.shell, liftStyle]}>
      <Box style={styles.clip}>
        <LinearGradient colors={colors.gradients.hero} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.topRow, topRowStyle]}>
          <Box style={styles.row}>
            <Box style={styles.side} align="flex-start">
              <IconButton icon={X} tone="onBrand" variant="soft" onPress={onClose} accessibilityLabel={closeLabel} />
            </Box>
            <Box flex={1} row align="center" justify="center" gap="sm">
              {center}
            </Box>
            <Box style={styles.side} align="flex-end">
              {trailing}
            </Box>
          </Box>
        </Animated.View>
        <Box style={styles.row}>
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              {index > 0 ? <WizardRailConnector filled={index <= current} draws={index === current} /> : null}
              <WizardRailStop step={step} position={`${index + 1}/${steps.length}`} onPress={onStepPress} />
            </React.Fragment>
          ))}
        </Box>
        {strip ? (
          <Box style={styles.strip} accessibilityRole="alert">
            <Box flex={1}>
              <Text variant="caption" color={colors.text.onBrand} numberOfLines={2}>
                {strip.text}
              </Text>
            </Box>
            <CustomButton title={strip.actionLabel} variant="glass" size="sm" onPress={strip.onAction} />
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const WizardRailHeader = memo(WizardRailHeaderComponent) as typeof WizardRailHeaderComponent;
