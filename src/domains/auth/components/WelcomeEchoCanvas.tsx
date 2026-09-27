import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Group, Path, RoundedRect, vec } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ICON_VIEWBOX, SKIA_ICON_PATHS } from '@/shared/ui';
import type { SkiaIconName } from '@/shared/ui';
import { iconStroke, motion, useTheme } from '@/core/theme';

// One loop of the echo, ms. Everything below derives from this single clock,
// so the whole scene costs one animation driver on the UI thread.
const LOOP_MS = 4200;
const TAU = Math.PI * 2;
const RING_COUNT = 3;
const PARTICLE_COUNT = 12;

// Logo geometry v4 (rule 08) in its 100-unit viewBox: start arcs, end arcs, dot.
const LOGO_VIEWBOX = 100;
const LOGO_TILT = (-20 * Math.PI) / 180;
const LOGO_STROKE = 6;
const LOGO_DOT_R = 9;
const ARCS_START = [
  'M37.79 64.55A19 19 0 0 1 37.79 35.45',
  'M30.72 72.98A30 30 0 0 1 30.72 27.02',
  'M23.65 81.41A41 41 0 0 1 23.65 18.59',
] as const;
const ARCS_END = [
  'M62.21 35.45A19 19 0 0 1 62.21 64.55',
  'M69.28 27.02A30 30 0 0 1 69.28 72.98',
  'M76.35 18.59A41 41 0 0 1 76.35 81.41',
] as const;
// Fade A: inner faint → outer strong.
const ARC_OPACITY = [0.5, 0.75, 1] as const;

interface ChipSpec {
  icon: SkiaIconName;
  tone: 'interactive' | 'money';
  /** Position on the orbit, radians (0 = end side). */
  angle: number;
  /** Bob phase offset, 0–1. */
  phase: number;
}

const CHIPS: readonly ChipSpec[] = [
  { icon: 'megaphone', tone: 'interactive', angle: -2.4, phase: 0 },
  { icon: 'shieldCheck', tone: 'interactive', angle: -0.7, phase: 0.25 },
  { icon: 'chartColumn', tone: 'interactive', angle: 2.5, phase: 0.5 },
  // Wallet = escrow money → the only mint element (rule 08).
  { icon: 'wallet', tone: 'money', angle: 0.75, phase: 0.75 },
];

// Deterministic "random" layout so the scene is identical on every render.
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  seed: (i * 0.618) % 1,
  x: ((i * 37) % 90) / 100 - 0.45,
  speed: 0.6 + ((i * 13) % 5) / 10,
  radius: 1.5 + (i % 3) * 0.75,
  warm: i % 3 === 0,
}));

export interface WelcomeEchoPalette {
  arcsStart: string;
  arcsEnd: string;
  dot: string;
  ring: string;
  chipFill: string;
  chipBorder: string;
  iconInteractive: string;
  iconMoney: string;
  particle: string;
  particleAccent: string;
}

interface SceneProps {
  size: number;
  clock: SharedValue<number>;
  enter: SharedValue<number>;
  palette: WelcomeEchoPalette;
}

const EchoRing: React.FC<SceneProps & { index: number }> = ({ size, clock, palette, index }) => {
  const center = size / 2;
  const r = useDerivedValue(() => {
    const p = (clock.value + index / RING_COUNT) % 1;
    return size * 0.16 + p * size * 0.34;
  });
  const opacity = useDerivedValue(() => {
    const p = (clock.value + index / RING_COUNT) % 1;
    return (1 - p) * 0.45;
  });
  return (
    <Circle
      cx={center}
      cy={center}
      r={r}
      style="stroke"
      strokeWidth={1.5}
      color={palette.ring}
      opacity={opacity}
    />
  );
};

const LogoArc: React.FC<{
  d: string;
  color: string;
  level: number;
  clock: SharedValue<number>;
}> = ({ d, color, level, clock }) => {
  // A wave travels inner → outer each loop, like sound leaving the dot.
  const opacity = useDerivedValue(() => {
    const wave = Math.max(0, Math.sin(TAU * (clock.value - level * 0.12)));
    const base = ARC_OPACITY[level] ?? 1;
    return base * (0.7 + 0.3 * wave);
  });
  return (
    <Path
      path={d}
      style="stroke"
      strokeWidth={LOGO_STROKE}
      strokeCap="round"
      color={color}
      opacity={opacity}
    />
  );
};

const EchoSymbol: React.FC<SceneProps> = ({ size, clock, enter, palette }) => {
  const symbolSize = size * 0.34;
  const offset = (size - symbolSize) / 2;
  const logoCenter = vec(LOGO_VIEWBOX / 2, LOGO_VIEWBOX / 2);

  const transform = useDerivedValue(() => [
    { translateX: offset },
    { translateY: offset },
    { scale: (symbolSize / LOGO_VIEWBOX) * (0.6 + 0.4 * enter.value) },
  ]);
  const origin = useMemo(() => vec(0, 0), []);
  const dotR = useDerivedValue(
    () => LOGO_DOT_R + Math.sin(TAU * clock.value) * 0.8,
  );
  const opacity = useDerivedValue(() => Math.min(Math.max(enter.value, 0), 1));

  return (
    <Group transform={transform} origin={origin} opacity={opacity}>
      <Group transform={[{ rotate: LOGO_TILT }]} origin={logoCenter}>
        {ARCS_START.map((d, level) => (
          <LogoArc key={d} d={d} color={palette.arcsStart} level={level} clock={clock} />
        ))}
        {ARCS_END.map((d, level) => (
          <LogoArc key={d} d={d} color={palette.arcsEnd} level={level} clock={clock} />
        ))}
      </Group>
      <Circle cx={LOGO_VIEWBOX / 2} cy={LOGO_VIEWBOX / 2} r={dotR} color={palette.dot} />
    </Group>
  );
};

const FloatingChip: React.FC<
  SceneProps & { spec: ChipSpec; order: number; chipSize: number; radius: number }
> = ({ size, clock, enter, palette, spec, order, chipSize, radius }) => {
  const orbit = size * 0.38;
  const cx = size / 2 + Math.cos(spec.angle) * orbit;
  const cy = size / 2 + Math.sin(spec.angle) * orbit;
  const x = cx - chipSize / 2;
  const y = cy - chipSize / 2;
  const iconSize = chipSize * 0.5;
  const iconOffset = (chipSize - iconSize) / 2;

  // Staggered after the symbol: each chip reaches full opacity a bit later.
  const appear = useDerivedValue(() =>
    Math.min(Math.max(enter.value * 2 - 0.4 - order * 0.15, 0), 1),
  );
  const transform = useDerivedValue(() => [
    { translateY: Math.sin(TAU * (clock.value + spec.phase)) * 6 + (1 - appear.value) * 12 },
    { rotate: Math.sin(TAU * (clock.value + spec.phase)) * 0.05 },
  ]);
  const origin = useMemo(() => vec(cx, cy), [cx, cy]);
  const iconTransform = useMemo(
    () => [
      { translateX: x + iconOffset },
      { translateY: y + iconOffset },
      { scale: iconSize / ICON_VIEWBOX },
    ],
    [x, y, iconOffset, iconSize],
  );
  const iconColor = spec.tone === 'money' ? palette.iconMoney : palette.iconInteractive;

  return (
    <Group transform={transform} origin={origin} opacity={appear}>
      <RoundedRect x={x} y={y} width={chipSize} height={chipSize} r={radius} color={palette.chipFill} />
      <RoundedRect
        x={x + 0.5}
        y={y + 0.5}
        width={chipSize - 1}
        height={chipSize - 1}
        r={radius - 0.5}
        style="stroke"
        strokeWidth={1}
        color={palette.chipBorder}
      />
      <Group transform={iconTransform}>
        {SKIA_ICON_PATHS[spec.icon].map(d => (
          <Path
            key={d}
            path={d}
            style="stroke"
            strokeWidth={iconStroke.regular}
            strokeCap="round"
            strokeJoin="round"
            color={iconColor}
          />
        ))}
      </Group>
    </Group>
  );
};

const Particle: React.FC<SceneProps & { index: number }> = ({ size, clock, palette, index }) => {
  const spec = PARTICLES[index] ?? PARTICLES[0];
  const progress = useDerivedValue(() => (clock.value * (spec?.speed ?? 1) + (spec?.seed ?? 0)) % 1);
  const cx = useDerivedValue(
    () => size / 2 + (spec?.x ?? 0) * size + Math.sin(progress.value * TAU) * 8,
  );
  const cy = useDerivedValue(() => size * 0.85 - progress.value * size * 0.7);
  const opacity = useDerivedValue(() => Math.sin(progress.value * Math.PI) * 0.7);
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={spec?.radius ?? 2}
      color={spec?.warm ? palette.particleAccent : palette.particle}
      opacity={opacity}
    />
  );
};

export interface WelcomeEchoCanvasProps {
  size: number;
}

/**
 * The welcome scene: the Sada echo symbol breathing at the centre, echo rings
 * leaving it, glass chips (campaigns, trust, results, escrow) floating on an
 * orbit and light particles rising. Static under reduced motion.
 */
const WelcomeEchoCanvasComponent: React.FC<WelcomeEchoCanvasProps> = ({ size }) => {
  const { colors, sizes, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const clock = useSharedValue(reduceMotion ? 0.3 : 0);
  const enter = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    enter.value = withDelay(motion.duration.fast, withSpring(1, motion.spring));
    clock.value = withRepeat(
      withTiming(1, { duration: LOOP_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(clock);
      cancelAnimation(enter);
    };
  }, [clock, enter, reduceMotion]);

  // Skia's reconciler can't read the theme context: resolve colors here.
  const palette = useMemo<WelcomeEchoPalette>(
    () => ({
      arcsStart: colors.logoOnBrand.arcsStart,
      arcsEnd: colors.logoOnBrand.arcsEnd,
      dot: colors.logoOnBrand.dot,
      ring: colors.glass.iconInteractive,
      chipFill: colors.glass.fill,
      chipBorder: colors.glass.border,
      iconInteractive: colors.glass.iconInteractive,
      iconMoney: colors.glass.iconMoney,
      particle: colors.logoOnBrand.arcsStart,
      particleAccent: colors.glass.iconInteractive,
    }),
    [colors],
  );

  const style = useMemo(() => ({ width: size, height: size }), [size]);
  const scene = { size, clock, enter, palette };

  return (
    <Canvas style={[styles.canvas, style]} pointerEvents="none">
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <EchoRing key={`ring-${i}`} {...scene} index={i} />
      ))}
      {PARTICLES.map((_, i) => (
        <Particle key={`particle-${i}`} {...scene} index={i} />
      ))}
      <EchoSymbol {...scene} />
      {CHIPS.map((spec, order) => (
        <FloatingChip
          key={spec.icon}
          {...scene}
          spec={spec}
          order={order}
          chipSize={sizes.avatar.md}
          radius={radii.md}
        />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: { alignSelf: 'center' },
});

export const WelcomeEchoCanvas = memo(WelcomeEchoCanvasComponent);
