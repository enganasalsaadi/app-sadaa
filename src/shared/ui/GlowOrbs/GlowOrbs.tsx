import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Canvas, Circle, Group, RadialGradient, Skia, vec } from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

/**
 * Fractions of the surface: `x` from the reading-start edge, `y` from the top, `r` of
 * the width. `drift` is how far one leg of the drift travels (fractions of the width)
 * and `pace` its length relative to `motion.loop.heroDrift`, so the lights never sync.
 */
const LIGHTS = [
  { key: 'end', x: 0.87, y: 0, r: 0.62, opacity: 0.3, drift: { x: -0.1, y: 0.08 }, grow: 0.08, pace: 1 },
  { key: 'start', x: 0.13, y: 1, r: 0.58, opacity: 0.55, drift: { x: 0.08, y: -0.06 }, grow: 0.1, pace: 1.22 },
  { key: 'highlight', x: 0.36, y: 0.22, r: 0.34, opacity: 0.07, drift: { x: -0.08, y: 0.04 }, grow: 0, pace: 0.83 },
] as const;

type LightDef = (typeof LIGHTS)[number];
const [END, START, HIGHLIGHT] = LIGHTS;
const DRIFT_MS = motion.loop.heroDrift;
/**
 * The lights move a few pixels a second, so redrawing them 20 times a second looks the same
 * as 60 and leaves the GPU two frames in three: every redraw repaints the whole hero canvas.
 */
const REDRAW_MS = 50;

// Skia interpolates unpremultiplied: fading to `transparent` (black) would muddy the glow.
const clearOf = (color: string) => {
  const c = Skia.Color(color);
  c[3] = 0;
  return c;
};

/** 0 → 1 → 0 over two legs, eased in and out (`Easing.inOut(Easing.sin)`), forever. */
const driftPhase = (elapsed: number, leg: number): number => {
  'worklet';
  const t = (elapsed / leg) % 2;
  const p = t > 1 ? 2 - t : t;
  return (1 - Math.cos(Math.PI * p)) / 2;
};

// Solid core, long soft edge: reads like a blurred light, never like a disc.
const STOPS = [0, 0.3, 1];

interface LightProps {
  def: LightDef;
  color: string;
  width: number;
  height: number;
  isRTL: boolean;
  phase: SharedValue<number>;
}

const Light = memo<LightProps>(({ def, color, width, height, isRTL, phase }) => {
  const dir = isRTL ? -1 : 1;
  const cx = width * (isRTL ? 1 - def.x : def.x);
  const cy = height * def.y;
  const r = width * def.r;
  const center = useMemo(() => vec(cx, cy), [cx, cy]);
  const colors = useMemo(() => [color, color, clearOf(color)], [color]);
  const transform = useDerivedValue(() => [
    { translateX: dir * def.drift.x * width * phase.value },
    { translateY: def.drift.y * width * phase.value },
    { scale: 1 + def.grow * phase.value },
  ]);

  return (
    <Group transform={transform} origin={center} opacity={def.opacity}>
      <Circle c={center} r={r}>
        <RadialGradient c={center} r={r} colors={colors} positions={STOPS} />
      </Circle>
    </Group>
  );
});

/**
 * Hero lights for navy surfaces (Layout `brandGlow`, rule 08 v4): three large diffuse
 * teal-family lights that drift very slowly, one of the three allowed loops (rule 09
 * §3.1). No outlines or shapes. Reduced motion holds them still. Fills its parent,
 * draws nothing until measured, never takes touches. Belongs over navy only.
 * `paused` freezes them in place: every redraw repaints the canvas, so a hero that is off
 * screen or on a tab in the background must not keep the GPU busy.
 */
const GlowOrbsComponent: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const end = useSharedValue(0);
  const start = useSharedValue(0);
  const highlight = useSharedValue(0);

  const elapsed = useSharedValue(0);
  const drawnAt = useSharedValue(-REDRAW_MS);

  // One clock for all three lights; it keeps its time across pauses so they resume in place.
  const frame = useFrameCallback(info => {
    elapsed.value += info.timeSincePreviousFrame ?? 0;
    if (elapsed.value - drawnAt.value < REDRAW_MS) return;
    drawnAt.value = elapsed.value;
    end.value = driftPhase(elapsed.value, DRIFT_MS * END.pace);
    start.value = driftPhase(elapsed.value, DRIFT_MS * START.pace);
    highlight.value = driftPhase(elapsed.value, DRIFT_MS * HIGHLIGHT.pace);
  }, false);

  useEffect(() => {
    frame.setActive(!reduceMotion && !paused);
    return () => frame.setActive(false);
  }, [frame, paused, reduceMotion]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const { width, height } = size;

  return (
    <Box style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {width > 0 && height > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Light def={END} color={colors.glass.glowSecondary} width={width} height={height} isRTL={isRTL} phase={end} />
          <Light def={START} color={colors.glass.glowPrimary} width={width} height={height} isRTL={isRTL} phase={start} />
          <Light
            def={HIGHLIGHT}
            color={colors.glass.glowHighlight}
            width={width}
            height={height}
            isRTL={isRTL}
            phase={highlight}
          />
        </Canvas>
      ) : null}
    </Box>
  );
};

export const GlowOrbs = memo(GlowOrbsComponent);
