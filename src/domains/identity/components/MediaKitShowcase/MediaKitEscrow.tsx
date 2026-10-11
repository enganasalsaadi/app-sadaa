import React, { memo, useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Check, ShieldCheck, Store, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import type { ContractTerms } from '@/core/api';
import { Box, GradientSurface, Pressable, Text, useLayoutInView, useLoopClock } from '@/shared/ui';
import { MediaKitRise } from './MediaKitRise';
import { MediaKitTermsSheet } from './MediaKitTermsSheet';

const LOOP_MS = 6000;
const NODE = moderateScale(52);
const NODE_ICON = moderateScale(22);
const COIN = moderateScale(24);
const RAIL = moderateScale(4);
const STEP_DOT = moderateScale(28);
const PROGRESS = moderateScale(3);
const PATH_HEIGHT = moderateScale(82);
const DONE_HEIGHT = moderateScale(24);
/** The coin shrinks while it rests in escrow: held, not moving. */
const COIN_HELD = 0.7;

/**
 * One loop, as fractions of `LOOP_MS`: pay (coin to escrow) → hold → "published" → release
 * (coin to the creator). Every part below reads these, so they can never drift apart.
 */
const PHASE = {
  appear: 0.06,
  atVault: 0.3,
  held: 0.34,
  published: 0.44,
  publishedIn: 0.5,
  release: 0.56,
  atCreator: 0.8,
  received: 0.82,
  gone: 0.88,
  rest: 0.92,
  fade: 0.96,
} as const;

/** Each step is lit through its own phase of the loop. */
const STEPS = [
  { key: 'pay', title: 'account.mediaKit.showcase.escrow.step1Title', body: 'account.mediaKit.showcase.escrow.step1Body', from: 0, to: PHASE.atVault, off: PHASE.held },
  { key: 'hold', title: 'account.mediaKit.showcase.escrow.step2Title', body: 'account.mediaKit.showcase.escrow.step2Body', from: PHASE.held - 0.02, to: 0.54, off: 0.58 },
  { key: 'release', title: 'account.mediaKit.showcase.escrow.step3Title', body: 'account.mediaKit.showcase.escrow.step3Body', from: 0.58, to: 0.9, off: PHASE.fade },
] as const satisfies readonly { key: string; title: ParseKeys; body: ParseKeys; from: number; to: number; off: number }[];

type Step = (typeof STEPS)[number];

interface ClockProps {
  clock: SharedValue<number>;
  still: boolean;
}

const Node = memo<{ icon: LucideIcon; label: string; vault?: boolean; glow: 'send' | 'hold' | 'receive' } & ClockProps>(
  ({ icon: Icon, label, vault = false, glow, clock, still }) => {
    const { colors } = useTheme();
    const { escrow, glass } = colors;
    const mint = glass.iconMoney;
    const style = useAnimatedStyle(() => {
      const p = clock.value;
      if (still) return {};
      switch (glow) {
        case 'send':
          return {
            borderColor: interpolateColor(p, [0, 0.04, 0.14, 0.24], [glass.border, mint, mint, glass.border]),
          };
        case 'hold':
          return {
            transform: [{ scale: interpolate(p, [0.28, 0.36, 0.48, 0.56], [1, 1.08, 1.08, 1], 'clamp') }],
          };
        default:
          return {
            backgroundColor: interpolateColor(
              p,
              [0, PHASE.atCreator - 0.02, PHASE.received, PHASE.rest, 1],
              [escrow.node, escrow.node, mint, mint, escrow.node],
            ),
          };
      }
    }, [glow, still]);
    const styles = useStyles(
      ({ radii, borderWidths }) => ({
        tile: {
          width: NODE,
          height: NODE,
          borderRadius: radii.lg,
          borderWidth: borderWidths.thin,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          backgroundColor: vault ? escrow.vaultFill : escrow.node,
          borderColor: vault ? escrow.vaultBorder : glass.border,
        },
      }),
      [vault],
    );
    return (
      <Box align="center" gap="xs" width={NODE}>
        <Animated.View style={[styles.tile, style]}>
          <Icon size={NODE_ICON} color={vault ? mint : colors.text.onBrand} />
        </Animated.View>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {label}
        </Text>
      </Box>
    );
  },
);

const RailFill = memo<{ from: number; to: number } & ClockProps>(({ from, to, clock, still }) => {
  const { colors, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii }) => ({
      rail: { flex: 1, height: RAIL, marginTop: NODE / 2 - RAIL / 2, borderRadius: radii.xs, backgroundColor: colors.escrow.track, overflow: 'hidden' as const },
      fill: { flex: 1, backgroundColor: colors.glass.iconMoney },
    }),
    [],
  );
  const fill = useAnimatedStyle(() => ({
    transformOrigin: isRTL ? 'right' : 'left',
    transform: [
      { scaleX: still ? 1 : interpolate(clock.value, [0, from, to, PHASE.rest, 1], [0, 0, 1, 1, 0], 'clamp') },
    ],
  }), [from, isRTL, still, to]);
  return (
    <Box style={styles.rail}>
      <Animated.View style={[styles.fill, fill]} />
    </Box>
  );
});

/** The coin and the "Published" pill, laid out left to right so the path math is physical. */
const Traveller = memo<{ width: number } & ClockProps>(({ width, clock, still }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }) => ({
      layer: { position: 'absolute' as const, top: 0, start: 0, end: 0, height: PATH_HEIGHT, direction: 'ltr' as const },
      coin: {
        position: 'absolute' as const,
        top: NODE / 2 - COIN / 2,
        width: COIN,
        height: COIN,
        borderRadius: radii.full,
        backgroundColor: colors.glass.iconMoney,
        borderWidth: borderWidths.xl,
        borderColor: colors.escrow.coinHalo,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      done: {
        position: 'absolute' as const,
        top: -DONE_HEIGHT - spacing.xs,
        height: DONE_HEIGHT,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.full,
        backgroundColor: colors.escrow.doneBg,
      },
    }),
    [],
  );
  const [doneWidth, setDoneWidth] = useState(0);
  const onDoneLayout = useCallback((event: LayoutChangeEvent) => setDoneWidth(event.nativeEvent.layout.width), []);

  // Reading start (brand) → end (creator), as physical x of the coin's centre.
  const startX = NODE / 2;
  const endX = width - NODE / 2;
  const coin = useAnimatedStyle(() => {
    const p = clock.value;
    const s = interpolate(
      p,
      [0, PHASE.appear, PHASE.atVault, PHASE.release, PHASE.atCreator, 1],
      [0, 0, 0.5, 0.5, 1, 1],
      'clamp',
    );
    const along = isRTL ? 1 - s : s;
    const x = startX + (endX - startX) * along - COIN / 2;
    const scale = interpolate(
      p,
      [0, PHASE.appear, PHASE.atVault, PHASE.held, PHASE.publishedIn, PHASE.release, PHASE.atCreator, PHASE.gone, 1],
      [0, 1, 1, COIN_HELD, COIN_HELD, 1, 1, 0, 0],
      'clamp',
    );
    return { transform: [{ translateX: x }, { scale: still ? 0 : scale }] };
  }, [endX, isRTL, startX, still]);

  const done = useAnimatedStyle(() => {
    const scale = still
      ? 1
      : interpolate(clock.value, [0, PHASE.published, PHASE.publishedIn, 0.9, PHASE.fade, 1], [0, 0, 1, 1, 0, 0], 'clamp');
    return { transform: [{ translateX: width / 2 - doneWidth / 2 }, { scale }] };
  }, [doneWidth, still, width]);

  if (width <= 0) return null;

  return (
    <Box style={styles.layer} pointerEvents="none">
      <Animated.View style={[styles.done, done]} onLayout={onDoneLayout}>
        <Check size={sizes.icon.xs} color={colors.escrow.doneText} strokeWidth={iconStroke.bold} />
        <Text variant="caption" color={colors.escrow.doneText}>
          {t('account.mediaKit.showcase.escrow.published')}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.coin, coin]}>
        <Text variant="caption" color={colors.brand.main}>
          {t('account.mediaKit.showcase.escrow.coin')}
        </Text>
      </Animated.View>
    </Box>
  );
});

const StepRow = memo<{ step: Step; index: number } & ClockProps>(({ step, index, clock, still }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { escrow } = colors;
  const styles = useStyles(
    ({ radii, borderWidths }) => ({
      dot: { width: STEP_DOT, height: STEP_DOT },
      disc: {
        position: 'absolute' as const,
        top: 0,
        start: 0,
        width: STEP_DOT,
        height: STEP_DOT,
        borderRadius: radii.full,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      idle: { backgroundColor: escrow.stepIdle, borderWidth: borderWidths.sm, borderColor: escrow.stepIdleBorder },
      lit: { backgroundColor: colors.glass.iconMoney },
      track: { height: PROGRESS, borderRadius: radii.xs, backgroundColor: escrow.track, overflow: 'hidden' as const },
      bar: { flex: 1, backgroundColor: colors.glass.iconMoney },
    }),
    [],
  );
  const { isRTL } = useTheme();
  // The lit disc pops over the idle one through the step's phase (scale only).
  const lit = useAnimatedStyle(() => {
    if (still) return { transform: [{ scale: 1 }] };
    const p = clock.value;
    const on = p >= step.from && p < step.off;
    return { transform: [{ scale: on ? 1 : 0 }] };
  }, [step, still]);
  const bar = useAnimatedStyle(() => {
    const p = clock.value;
    const fill = p >= step.from && p < step.off ? interpolate(p, [step.from, step.to], [0, 1], 'clamp') : 0;
    return { transformOrigin: isRTL ? 'right' : 'left', transform: [{ scaleX: fill }] };
  }, [isRTL, step]);
  const number = String(index + 1);

  return (
    <Box row gap="md" py="sm" align="flex-start">
      <Box style={styles.dot}>
        <Box style={[styles.disc, styles.idle]}>
          <Text variant="buttonSmall" color={escrow.stepIdleText}>
            {number}
          </Text>
        </Box>
        <Animated.View style={[styles.disc, styles.lit, lit]}>
          <Text variant="buttonSmall" color={colors.brand.main}>
            {number}
          </Text>
        </Animated.View>
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="buttonSmall" color={colors.text.onBrand}>
          {t(step.title)}
        </Text>
        <Text variant="caption" color={escrow.stepSubtle}>
          {t(step.body)}
        </Text>
        {still ? null : (
          <Box style={styles.track} mt="xs">
            <Animated.View style={[styles.bar, bar]} />
          </Box>
        )}
      </Box>
    </Box>
  );
});

/**
 * "Your money is protected by Sada escrow": the money path brand → Sada escrow → creator,
 * a mint coin travelling it on a 6 s loop (held, "Published", then released), and the same
 * three moments as numbered lines, each lit with its phase (fill + progress, no fades). One
 * clock, paused off screen; reduced motion shows every step lit and the path still.
 */
const MediaKitEscrowComponent: React.FC<{ terms: ContractTerms['items'] }> = ({ terms }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { ref, onLayout, visible } = useLayoutInView({ track: true });
  const clock = useLoopClock(LOOP_MS, visible && !reduceMotion);
  const still = reduceMotion;
  const [pathWidth, setPathWidth] = useState(0);
  const [sheet, setSheet] = useState(false);
  const openTerms = useCallback(() => setSheet(true), []);
  const closeTerms = useCallback(() => setSheet(false), []);
  const onPathLayout = useCallback((event: LayoutChangeEvent) => setPathWidth(event.nativeEvent.layout.width), []);
  const styles = useStyles(
    ({ spacing, borderWidths, colors: palette }) => ({
      path: { height: PATH_HEIGHT, flexDirection: 'row' as const, alignItems: 'flex-start' as const, marginTop: spacing.xl },
      steps: { position: 'relative' as const },
      line: {
        position: 'absolute' as const,
        start: STEP_DOT / 2 - borderWidths.md / 2,
        top: spacing.lg,
        bottom: spacing.lg,
        width: borderWidths.md,
        backgroundColor: palette.escrow.rail,
      },
    }),
    [],
  );

  return (
    <MediaKitRise>
      <Animated.View ref={ref} onLayout={onLayout}>
        <GradientSurface variant="brand" borderRadius="xl" px="lg" pt="xl" pb="lg" gap="md">
          <Box row align="center" gap="sm">
            <ShieldCheck size={sizes.icon.md} color={colors.glass.iconMoney} />
            <Box flex={1}>
              <Text variant="title" color={colors.text.onBrand}>
                {t('account.mediaKit.showcase.escrow.title')}
              </Text>
            </Box>
            {terms.length > 0 ? (
              <Pressable
                onPress={openTerms}
                minHeight={sizes.button.md}
                justify="center"
                accessibilityRole="button"
                accessibilityLabel={t('account.mediaKit.showcase.escrow.terms', { count: terms.length })}
              >
                <Text variant="buttonSmall" color={colors.glass.iconInteractive}>
                  {t('account.mediaKit.showcase.escrow.terms', { count: terms.length })}
                </Text>
              </Pressable>
            ) : null}
          </Box>
          <Box style={styles.path} onLayout={onPathLayout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Node icon={Store} label={t('account.mediaKit.showcase.escrow.brand')} glow="send" clock={clock} still={still} />
            <RailFill from={PHASE.appear} to={PHASE.atVault} clock={clock} still={still} />
            <Node icon={ShieldCheck} label={t('account.mediaKit.showcase.escrow.vault')} vault glow="hold" clock={clock} still={still} />
            <RailFill from={PHASE.release} to={PHASE.atCreator} clock={clock} still={still} />
            <Node icon={User} label={t('account.mediaKit.showcase.escrow.creator')} glow="receive" clock={clock} still={still} />
            <Traveller width={pathWidth} clock={clock} still={still} />
          </Box>
          <Box style={styles.steps} accessibilityRole="list">
            <Box style={styles.line} />
            {STEPS.map((step, index) => (
              <StepRow key={step.key} step={step} index={index} clock={clock} still={still} />
            ))}
          </Box>
        </GradientSurface>
      </Animated.View>
      <MediaKitTermsSheet visible={sheet} onClose={closeTerms} terms={terms} />
    </MediaKitRise>
  );
};

export const MediaKitEscrow = memo(MediaKitEscrowComponent);
