import React, { memo, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Check, Layers, PenLine, Signature, X, type LucideIcon } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Avatar, Box, CustomButton, IconButton, Pressable, Text, useLayoutScrollY } from '@/shared/ui';
import { monogramOf } from '../../../utils/creatorText';
import { useOfferBuilder } from '../OfferBuilderContext';
import { OFFER_STEPS, type OfferStep } from '../hooks/useOfferBuilderScreen';

const ROW = moderateScale(52);
const NODE = moderateScale(36);
const AVATAR = moderateScale(28);
/** Equal start / end slots keep the creator's name centred whatever the save label says. */
const SIDE = moderateScale(72);
/** Upper bound for the current step's label + badge; the capsule opens up to its natural width. */
const LABEL_MAX = moderateScale(160);
const CONNECTOR = moderateScale(2);
/** Scroll distance over which the header lifts onto its shadow. */
const LIFT_DISTANCE = moderateScale(24);
/** Down-travel that tucks the top row away. */
const HIDE_TRAVEL = moderateScale(12);
/** Up-travel that brings it back: more than ROW, so the viewport growing by ROW on hide can't flip it. */
const SHOW_TRAVEL = ROW + moderateScale(16);

const STEP_LABEL = {
  services: 'marketplace.offer.header.steps.services',
  brief: 'marketplace.offer.header.steps.brief',
  review: 'marketplace.offer.header.steps.sign',
} as const satisfies Record<OfferStep, string>;

const STEP_ICON = {
  services: Layers,
  brief: PenLine,
  review: Signature,
} as const satisfies Record<OfferStep, LucideIcon>;

const SaveLabel = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { saveState } = useOfferBuilder();
  if (saveState === 'idle') return null;
  const [label, color] =
    saveState === 'saving'
      ? [t('marketplace.offer.header.saving'), colors.text.onBrandMuted]
      : saveState === 'saved'
        ? [t('marketplace.offer.header.saved'), colors.glass.iconInteractive]
        : [t('marketplace.offer.header.saveFailed'), colors.glass.iconWarning];
  return (
    <Text variant="caption" color={color} numberOfLines={1} accessibilityLiveRegion="polite">
      {label}
    </Text>
  );
});

interface ConnectorProps {
  filled: boolean;
  /** The line leading into the step that just opened: it draws in on mount. */
  draws: boolean;
}

const Connector = memo<ConnectorProps>(({ filled, draws }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(filled && (!draws || reduceMotion) ? 1 : 0);
  useEffect(() => {
    if (!draws || reduceMotion) return;
    fill.value = withTiming(1, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [draws, fill, reduceMotion]);
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
});

interface StepNodeProps {
  step: OfferStep;
  index: number;
  current: number;
  onPress: (step: OfferStep) => void;
}

/**
 * One stop on the rail. Upcoming = outline circle with the step's own icon, done = teal circle with
 * a check (tap to go back), current = white capsule that opens to show icon, name and «2/3».
 */
const StepNode = memo<StepNodeProps>(({ step, index, current, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, shadows } = useTheme();
  const reduceMotion = useReducedMotion();
  const done = index < current;
  const now = index === current;
  const label = t(STEP_LABEL[step]);
  const Icon = done ? Check : STEP_ICON[step];

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
        borderColor: done ? colors.glass.iconInteractive : colors.glass.border,
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
    [colors.brand.soft, colors.glass, colors.text.onBrand, done, shadows.md, sizes.icon.sm],
  );

  const a11yLabel = t('marketplace.offer.header.stepA11y', { step: index + 1, label });

  if (now) {
    return (
      <Box
        style={styles.capsule}
        accessible
        accessibilityRole="header"
        accessibilityState={{ selected: true }}
        accessibilityLabel={a11yLabel}
      >
        <Icon size={sizes.icon.sm} color={colors.brand.main} />
        <Animated.View style={[styles.reveal, revealStyle]}>
          <Text variant="label" color={colors.brand.main} numberOfLines={1} ms="sm">
            {label}
          </Text>
          <Box style={styles.badge}>
            <Text variant="caption" color={colors.brand.text}>
              {`${index + 1}/${OFFER_STEPS.length}`}
            </Text>
          </Box>
        </Animated.View>
      </Box>
    );
  }

  return (
    <Pressable
      style={styles.node}
      disabled={!done}
      onPress={() => onPress(step)}
      hitSlop={sizes.hitSlop.sm}
      accessibilityRole="button"
      accessibilityState={{ disabled: !done }}
      accessibilityLabel={a11yLabel}
    >
      <Icon
        size={sizes.icon.sm}
        color={done ? colors.glass.onIconInteractive : colors.text.onBrandMuted}
        strokeWidth={done ? 3 : 2}
      />
    </Pressable>
  );
});

/**
 * Straight navy bar over the builder, painted up behind the status bar. Top row: close, the
 * creator (photo + name, centred), the save state as words. Below it the step rail, where the
 * current step is a white capsule with its icon, name and position. Scrolling down tucks the top
 * row away so only the rail stays; scrolling back up brings it back.
 */
const OfferTicketHeaderComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const { top } = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { creator, creatorName, stepIndex, goToStep, onClose, quoteBlocker, onBlockerAction } = useOfferBuilder();
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
    ({ borderWidths, radii, spacing }): Record<'shell' | 'clip' | 'topRow' | 'row' | 'side' | 'face' | 'strip', ViewStyle> => ({
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
      face: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.sm,
        borderColor: colors.glass.border,
      },
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
              <IconButton
                icon={X}
                tone="onBrand"
                variant="soft"
                onPress={onClose}
                accessibilityLabel={t('marketplace.offer.header.close')}
              />
            </Box>
            <Box flex={1} row align="center" justify="center" gap="sm">
              <Box style={styles.face}>
                {creator?.avatarUrl ? (
                  <Avatar uri={creator.avatarUrl} size={AVATAR} />
                ) : (
                  <Text variant="caption" color={colors.text.onBrand}>
                    {monogramOf(creatorName)}
                  </Text>
                )}
              </Box>
              <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
                {creatorName}
              </Text>
            </Box>
            <Box style={styles.side} align="flex-end">
              <SaveLabel />
            </Box>
          </Box>
        </Animated.View>
        <Box style={styles.row}>
          {OFFER_STEPS.map((step, index) => (
            <React.Fragment key={step}>
              {index > 0 ? <Connector filled={index <= stepIndex} draws={index === stepIndex} /> : null}
              <StepNode step={step} index={index} current={stepIndex} onPress={goToStep} />
            </React.Fragment>
          ))}
        </Box>
        {quoteBlocker ? (
          <Box style={styles.strip} accessibilityRole="alert">
            <Box flex={1}>
              <Text variant="caption" color={colors.text.onBrand} numberOfLines={2}>
                {quoteBlocker.label}
              </Text>
            </Box>
            <CustomButton
              title={t('marketplace.offer.blocked.strip')}
              variant="glass"
              size="sm"
              onPress={() => onBlockerAction(quoteBlocker)}
            />
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const OfferTicketHeader = memo(OfferTicketHeaderComponent);
