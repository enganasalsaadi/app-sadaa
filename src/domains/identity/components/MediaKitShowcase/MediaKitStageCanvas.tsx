import React, { memo, useMemo } from 'react';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
  type SkPath,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { useLoopClock } from '@/shared/ui';
import { MediaKitStageBackdrop } from './MediaKitStageBackdrop';

/**
 * One master period for the whole stage; every loop below is a whole number of cycles of
 * it, so nothing jumps when the clock wraps. 180 s = rings 3.6 s, turning ring 10 s,
 * waves 12 s and 18 s.
 */
const PERIOD_MS = 180000;
const CYCLES = { rings: 50, sweep: 18, waveFront: 15, waveBack: 10 } as const;
const TAU = Math.PI * 2;
const RING_COUNT = 3;
/** Echo rings grow from just inside the photo ring to three times its radius, fading out. */
const RING_FROM = 0.85;
const RING_TO = 3;
const RING_ALPHA = 0.22;
const RING_WIDTH = 1.5;
const WAVE_BACK_ALPHA = 0.55;

const WAVE_HEIGHT = moderateScale(70);
const WAVES = {
  back: { base: 0.57, amp: 0.17 },
  front: { base: 0.69, amp: 0.14 },
} as const;
/** Below this share of the wave band the front wave is solid page colour, so the navy can stop there. */
const NAVY_FLOOR = WAVES.front.base + WAVES.front.amp + 0.05;
const WAVE_STEP = 8;
/** The waves run this far past their canvas' bottom edge, so its last (fractional) pixel row is painted. */
const WAVE_OVERDRAW = 4;

/** A sine band twice the stage width (one wave per width), so sliding it by a width loops. */
const buildWave = (width: number, base: number, amp: number): SkPath => {
  const path = Skia.Path.Make();
  const mid = WAVE_HEIGHT * base;
  const lift = WAVE_HEIGHT * amp;
  path.moveTo(0, mid);
  for (let x = WAVE_STEP; x <= width * 2; x += WAVE_STEP) {
    path.lineTo(x, mid + Math.sin((x / width) * TAU) * lift);
  }
  path.lineTo(width * 2, WAVE_HEIGHT + WAVE_OVERDRAW);
  path.lineTo(0, WAVE_HEIGHT + WAVE_OVERDRAW);
  path.close();
  return path;
};

interface RingProps {
  clock: SharedValue<number>;
  index: number;
  center: number;
  radius: number;
  color: string;
}

const EchoRing = memo<RingProps>(({ clock, index, center, radius, color }) => {
  const phase = useDerivedValue(() => (clock.value * CYCLES.rings + index / RING_COUNT) % 1);
  const r = useDerivedValue(() => radius * (RING_FROM + (RING_TO - RING_FROM) * phase.value));
  const opacity = useDerivedValue(() => RING_ALPHA * (1 - phase.value));
  return (
    <Circle cx={center} cy={center} r={r} style="stroke" strokeWidth={RING_WIDTH} color={color} opacity={opacity} />
  );
});

interface WaveProps {
  clock: SharedValue<number>;
  cycles: number;
  path: SkPath;
  width: number;
  color: string;
  opacity?: number;
}

const Wave = memo<WaveProps>(({ clock, cycles, path, width, color, opacity }) => {
  const transform = useDerivedValue(() => [{ translateX: -((clock.value * cycles) % 1) * width }]);
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path} color={color} />
    </Group>
  );
});

export interface MediaKitStageCanvasProps {
  width: number;
  height: number;
  /** Centre of the photo, where the echo rings and the turning ring sit. */
  photoX: number;
  photoY: number;
  /** Outer radius of the turning ring. */
  ringRadius: number;
  ringWidth: number;
  /** A cover photo sits under the stage: the navy lets it through at the top only. */
  overCover: boolean;
  running: boolean;
}

/**
 * The media kit stage on one clock, split by cost: the still artwork (navy, dots, lines,
 * sparkles, lights) paints once in a full-size canvas, and only two small canvases redraw
 * per frame, a square around the photo (echo rings + turning ring) and the bottom band (two
 * waves melting into the page). Scrolling never repaints the whole stage. `running` false
 * freezes the loop.
 */
const MediaKitStageCanvasComponent: React.FC<MediaKitStageCanvasProps> = ({
  width,
  height,
  photoX,
  photoY,
  ringRadius,
  ringWidth,
  overCover,
  running,
}) => {
  const { colors } = useTheme();
  const clock = useLoopClock(PERIOD_MS, running);
  const { stage } = colors;
  const ringBox = Math.ceil((ringRadius * RING_TO + RING_WIDTH) * 2);
  const ringCenter = ringBox / 2;
  const waves = useMemo(
    () => ({
      back: buildWave(width, WAVES.back.base, WAVES.back.amp),
      front: buildWave(width, WAVES.front.base, WAVES.front.amp),
    }),
    [width],
  );
  const styles = useStyles(
    () => ({
      rings: {
        position: 'absolute' as const,
        top: photoY - ringCenter,
        start: photoX - ringCenter,
        width: ringBox,
        height: ringBox,
      },
      waves: {
        position: 'absolute' as const,
        top: height - WAVE_HEIGHT,
        start: 0,
        width,
        height: WAVE_HEIGHT,
      },
    }),
    [height, photoX, photoY, ringBox, ringCenter, width],
  );
  const sweepCenter = vec(ringCenter, ringCenter);
  const sweep = useDerivedValue(() => [{ rotate: ((clock.value * CYCLES.sweep) % 1) * TAU }]);

  if (width <= 0 || height <= 0) return null;

  return (
    <>
      <MediaKitStageBackdrop
        width={width}
        height={height}
        navyHeight={height - WAVE_HEIGHT * (1 - NAVY_FLOOR)}
        overCover={overCover}
      />
      <Canvas style={styles.rings} pointerEvents="none">
        {Array.from({ length: RING_COUNT }, (_, index) => (
          <EchoRing
            key={index}
            clock={clock}
            index={index}
            center={ringCenter}
            radius={ringRadius}
            color={stage.ring}
          />
        ))}
        <Group transform={sweep} origin={sweepCenter}>
          <Circle c={sweepCenter} r={ringRadius - ringWidth / 2} style="stroke" strokeWidth={ringWidth}>
            <SweepGradient c={sweepCenter} colors={stage.ringSweep} />
          </Circle>
        </Group>
      </Canvas>
      <Canvas style={styles.waves} pointerEvents="none">
        <Wave
          clock={clock}
          cycles={CYCLES.waveBack}
          path={waves.back}
          width={width}
          color={colors.layout.base}
          opacity={WAVE_BACK_ALPHA}
        />
        <Wave clock={clock} cycles={CYCLES.waveFront} path={waves.front} width={width} color={colors.layout.base} />
      </Canvas>
    </>
  );
};

export const MediaKitStageCanvas = memo(MediaKitStageCanvasComponent);

/** Bottom band the waves take: the stage content keeps clear of it. */
export const STAGE_WAVE_HEIGHT = WAVE_HEIGHT;
/** The photo's box; the turning ring sits 12 in from it, the photo just inside the ring. */
export const STAGE_BOX = moderateScale(128);
export const STAGE_RING_RADIUS = moderateScale(52);
export const STAGE_RING_WIDTH = moderateScale(4);
export const STAGE_PHOTO = (STAGE_RING_RADIUS - STAGE_RING_WIDTH) * 2;
