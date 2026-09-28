import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, DashPathEffect } from '@shopify/react-native-skia';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { BellRing, Eye } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, BrandLogo, SocialPlatformIcon } from '@/shared/ui';
import type { InfluencerPlatform } from '../schemas';
import { GlassPill } from './GlassPill';

// Performance budget (old Android): one linear clock drives everything, Skia
// draws ~10 animated primitives (no blur, no text, no shaders), and the
// orbiting views only animate `transform`, so no view ever needs an offscreen
// alpha layer. Integer multiples of the clock keep every loop seamless.
const ORBIT_MS = 36000;
const PULSES_PER_ORBIT = 12;
const HINTS_PER_ORBIT = 4;
const RING_COUNT = 3;
const TAU = Math.PI * 2;
const REDUCED_CLOCK = 0.08;

const SPARKS = Array.from({ length: 6 }, (_, i) => ({
  angle: (i / 6) * TAU + 0.4,
  speed: 3 + (i % 3),
  seed: (i * 0.618) % 1,
  radius: 1.5 + (i % 3) * 0.5,
}));

interface Hint {
  icon: LucideIcon;
  labelKey: 'auth.influencerOnboarding.welcome.hintDiscover' | 'auth.influencerOnboarding.welcome.hintOffers';
  corner: 'topEnd' | 'bottomStart';
}

const HINTS: readonly Hint[] = [
  { icon: Eye, labelKey: 'auth.influencerOnboarding.welcome.hintDiscover', corner: 'topEnd' },
  { icon: BellRing, labelKey: 'auth.influencerOnboarding.welcome.hintOffers', corner: 'bottomStart' },
];

interface Geometry {
  size: number;
  c: number;
  discR: number;
  innerR: number;
  outerR: number;
  slotW: number;
  slotH: number;
}

const PulseRing: React.FC<{ g: Geometry; clock: SharedValue<number>; index: number; color: string }> = ({
  g,
  clock,
  index,
  color,
}) => {
  const r = useDerivedValue(() => {
    const p = (clock.value * PULSES_PER_ORBIT + index / RING_COUNT) % 1;
    return g.discR + p * (g.c - g.discR);
  });
  const opacity = useDerivedValue(() => {
    const p = (clock.value * PULSES_PER_ORBIT + index / RING_COUNT) % 1;
    return (1 - p) * 0.45;
  });
  return <Circle cx={g.c} cy={g.c} r={r} style="stroke" strokeWidth={1.5} color={color} opacity={opacity} />;
};

const Spark: React.FC<{ g: Geometry; clock: SharedValue<number>; index: number; color: string }> = ({
  g,
  clock,
  index,
  color,
}) => {
  const spec = SPARKS[index] ?? { angle: 0, speed: 3, seed: 0, radius: 2 };
  const progress = useDerivedValue(() => (clock.value * spec.speed + spec.seed) % 1);
  const cx = useDerivedValue(() => g.c + Math.cos(spec.angle) * (g.discR + progress.value * (g.c - g.discR)));
  const cy = useDerivedValue(() => g.c + Math.sin(spec.angle) * (g.discR + progress.value * (g.c - g.discR)));
  const opacity = useDerivedValue(() => Math.sin(progress.value * Math.PI) * 0.7);
  return <Circle cx={cx} cy={cy} r={spec.radius} color={color} opacity={opacity} />;
};

interface OrbitSlotProps {
  g: Geometry;
  clock: SharedValue<number>;
  enter: SharedValue<number>;
  radius: number;
  offset: number;
  /** 1 clockwise, −1 counter-clockwise. */
  direction: 1 | -1;
  children: React.ReactNode;
}

/** Positions its child on a circle around the centre; transform-only. */
const OrbitSlot: React.FC<OrbitSlotProps> = ({ g, clock, enter, radius, offset, direction, children }) => {
  const frame = useMemo(
    () => ({ top: g.c - g.slotH / 2, start: g.c - g.slotW / 2, width: g.slotW, height: g.slotH }),
    [g],
  );
  const animated = useAnimatedStyle(() => {
    const a = offset + direction * clock.value * TAU;
    const e = Math.max(enter.value, 0);
    return {
      transform: [
        { translateX: Math.cos(a) * radius * e },
        { translateY: Math.sin(a) * radius * e },
        { scale: Math.min(e, 1.1) },
      ],
    };
  });
  return <Animated.View style={[styles.slot, frame, animated]}>{children}</Animated.View>;
};

/** Pops in, holds, pops out; one hint at a time. */
const HintBubble: React.FC<{ clock: SharedValue<number>; index: number; hint: Hint; maxWidth: number }> = ({
  clock,
  index,
  hint,
  maxWidth,
}) => {
  const { t } = useTranslation();
  const animated = useAnimatedStyle(() => {
    const c = (clock.value * HINTS_PER_ORBIT + index / HINTS.length) % 1;
    const edge = 0.04;
    const visible = 0.4;
    let s = 0;
    if (c < edge) s = c / edge;
    else if (c < visible - edge) s = 1;
    else if (c < visible) s = (visible - c) / edge;
    return { transform: [{ scale: s }] };
  });
  return (
    <Animated.View style={[styles.hint, hint.corner === 'topEnd' ? styles.topEnd : styles.bottomStart, animated]}>
      <GlassPill icon={hint.icon} label={t(hint.labelKey)} maxWidth={maxWidth} />
    </Animated.View>
  );
};

export interface CreatorOrbitSceneProps {
  size: number;
  platforms: readonly InfluencerPlatform[];
  niches: readonly string[];
  /** MEGA tier: mustard ring around the core (premium, rule 08). */
  isTopTier: boolean;
}

/**
 * Creator welcome: the Sada symbol at the core sends echo rings out; the
 * creator's platforms orbit the inner track and niches counter-orbit the
 * outer one, while hint bubbles pop in. Static final frame under reduced motion.
 */
const CreatorOrbitSceneComponent: React.FC<CreatorOrbitSceneProps> = ({ size, platforms, niches, isTopTier }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const clock = useSharedValue(reduceMotion ? REDUCED_CLOCK : 0);
  const enter = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    enter.value = withDelay(motion.duration.slow, withSpring(1, motion.spring));
    clock.value = withRepeat(withTiming(1, { duration: ORBIT_MS, easing: Easing.linear }), -1, false);
    return () => {
      cancelAnimation(clock);
      cancelAnimation(enter);
    };
  }, [clock, enter, reduceMotion]);

  const g = useMemo<Geometry>(
    () => ({
      size,
      c: size / 2,
      discR: size * 0.15,
      innerR: size * 0.27,
      outerR: size * 0.41,
      slotW: size * 0.4,
      slotH: sizes.button.md,
    }),
    [size, sizes.button.md],
  );

  const coreStyle = useAnimatedStyle(() => {
    const p = (clock.value * PULSES_PER_ORBIT) % 1;
    return { transform: [{ scale: 1 + Math.sin(p * TAU) * 0.03 * enter.value }] };
  });

  const stageStyle = useMemo(() => ({ width: size, height: size }), [size]);
  const ringColor = colors.glass.iconInteractive;
  const sparkColor = colors.logoOnBrand.arcsStart;

  return (
    <Box style={stageStyle} alignSelf="center" pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle cx={g.c} cy={g.c} r={g.innerR} style="stroke" strokeWidth={1} color={colors.glass.border}>
          <DashPathEffect intervals={[3, 7]} />
        </Circle>
        <Circle cx={g.c} cy={g.c} r={g.outerR} style="stroke" strokeWidth={1} color={colors.glass.border}>
          <DashPathEffect intervals={[3, 9]} />
        </Circle>
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <PulseRing key={`ring-${i}`} g={g} clock={clock} index={i} color={ringColor} />
        ))}
        {SPARKS.map((_, i) => (
          <Spark key={`spark-${i}`} g={g} clock={clock} index={i} color={sparkColor} />
        ))}
        <Circle cx={g.c} cy={g.c} r={g.discR} color={colors.glass.fill} />
        <Circle
          cx={g.c}
          cy={g.c}
          r={g.discR}
          style="stroke"
          strokeWidth={isTopTier ? 2 : 1}
          color={isTopTier ? colors.premium.main : colors.glass.border}
        />
      </Canvas>

      <Animated.View style={[StyleSheet.absoluteFill, styles.center, coreStyle]}>
        <BrandLogo variant="symbol" height={g.discR * 1.2} surface="brand" />
      </Animated.View>

      {platforms.map((platform, i) => (
        <OrbitSlot
          key={platform}
          g={g}
          clock={clock}
          enter={enter}
          radius={g.innerR}
          offset={(i / platforms.length) * TAU - Math.PI / 2}
          direction={1}
        >
          <Box
            width={sizes.button.md}
            height={sizes.button.md}
            borderRadius="full"
            align="center"
            justify="center"
            bg={colors.glass.badge}
            borderWidth="thin"
            borderColor={colors.glass.border}
          >
            <SocialPlatformIcon platform={platform} size={sizes.icon.sm} color={colors.text.onBrand} />
          </Box>
        </OrbitSlot>
      ))}

      {niches.map((label, i) => (
        <OrbitSlot
          key={label}
          g={g}
          clock={clock}
          enter={enter}
          radius={g.outerR}
          offset={(i / niches.length) * TAU + Math.PI / 6}
          direction={-1}
        >
          <GlassPill label={label} maxWidth={g.slotW} />
        </OrbitSlot>
      ))}

      {HINTS.map((hint, i) => (
        <HintBubble key={hint.labelKey} clock={clock} index={i} hint={hint} maxWidth={size * 0.62} />
      ))}
    </Box>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  slot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  hint: { position: 'absolute' },
  topEnd: { top: 0, end: 0 },
  bottomStart: { bottom: 0, start: 0 },
});

export const CreatorOrbitScene = memo(CreatorOrbitSceneComponent);
