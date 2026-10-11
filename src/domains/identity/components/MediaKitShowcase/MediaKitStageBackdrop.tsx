import React, { memo, useMemo } from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Skia,
  vec,
  type SkPath,
  type SkSize,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useStyles, useTheme } from '@/core/theme';

/** Artwork drawn on a 390 × 580 board, stretched to the measured stage. */
const BOARD = { w: 390, h: 580 } as const;
const DOT_STEP = 18;
const DOT_AREA = 0.46;
const WAVE_LINES = [
  'M-20 380 C 80 320, 160 440, 260 370 S 400 340, 420 380',
  'M-20 410 C 90 350, 170 470, 270 400 S 400 370, 420 410',
  'M-20 440 C 100 380, 180 500, 280 430 S 400 400, 420 440',
] as const;
const SPARKS = 'M40 120 l10 0 M45 115 l0 10 M330 280 l12 0 M336 274 l0 12';
/** Two lone dots on the board: a teal one high on the end side, a mustard one lower down. */
const SPARK_DOTS = [
  { key: 'cool', x: 340, y: 140, r: 4 },
  { key: 'warm', x: 60, y: 290, r: 3 },
] as const;
/** Gradient runs corner to corner, slightly inset so the navy holds at the top. */
const GRADIENT_X = { start: 0.2, end: 0.8 } as const;
const DOT_RADIUS = 1.2;
const LINE_WIDTH = 1.2;
const SPARK_WIDTH = 1.5;
/** Lights as fractions of the board: cool one off the top end corner, warm one low at the start. */
const LIGHTS = {
  cool: { x: 0.9, y: 0.05, r: 0.44, alpha: 0.38 },
  warm: { x: 0, y: 0.69, r: 0.39, alpha: 0.2 },
} as const;
const SPARK_DOT_ALPHA = 0.5;

/** A cover photo shows faintly at the top of the stage and is fully under the navy by this share of its height. */
export const STAGE_COVER_SHARE = 0.6;

// Skia interpolates unpremultiplied: fading to `transparent` (black) would muddy a light.
const clearOf = (color: string) => {
  const c = Skia.Color(color);
  c[3] = 0;
  return c;
};

/** Mask stops only carry coverage: the colour channels are ignored. */
const coverage = (alpha: number) => Float32Array.of(0, 0, 0, alpha);

const boardPath = (d: string, sx: number, sy: number): SkPath | null => {
  const path = Skia.Path.MakeFromSVGString(d);
  if (!path) return null;
  path.transform(Skia.Matrix().scale(sx, sy));
  return path;
};

interface MediaKitStageBackdropProps {
  width: number;
  height: number;
  /** The navy stops here, tucked under the waves' solid foot: no navy row can peek under the stage. */
  navyHeight: number;
  /** A cover photo sits under the stage: the navy lets it through at the top and closes over it lower down. */
  overCover: boolean;
}

/**
 * Everything on the stage that never moves, in its own canvas: the navy gradient, dot grid,
 * sound-wave lines, sparkles and the two soft lights. Its props only change with the stage
 * size, so it paints once and costs nothing while the page scrolls or the scene loops.
 * The art is clipped to the size the native canvas reports: a still canvas gets no later frame
 * to recover a first paint lost before its view was ready (seen on the first open: the cover
 * with no navy over it), so it repaints exactly when the native view gets or changes its size.
 */
const MediaKitStageBackdropComponent: React.FC<MediaKitStageBackdropProps> = ({
  width,
  height,
  navyHeight,
  overCover,
}) => {
  const { colors, isRTL } = useTheme();
  const { stage } = colors;
  const sx = width / BOARD.w;
  const sy = height / BOARD.h;
  const nativeSize = useSharedValue<SkSize>({ width: 0, height: 0 });
  const clip = useDerivedValue(() => Skia.XYWHRect(0, 0, nativeSize.value.width, nativeSize.value.height));
  const styles = useStyles(
    () => ({ canvas: { position: 'absolute' as const, top: 0, start: 0, width, height } }),
    [height, width],
  );

  const art = useMemo(() => {
    const dots = Skia.Path.Make();
    const dotStep = DOT_STEP * sx;
    for (let y = dotStep / 2; y < height * DOT_AREA; y += dotStep) {
      for (let x = dotStep / 2; x < width; x += dotStep) dots.addCircle(x, y, DOT_RADIUS);
    }
    const lines = Skia.Path.Make();
    WAVE_LINES.forEach(d => {
      const line = boardPath(d, sx, sy);
      if (line) lines.addPath(line);
    });
    return { dots, lines, sparks: boardPath(SPARKS, sx, sy) };
  }, [height, sx, sy, width]);

  if (width <= 0 || height <= 0) return null;

  // Mirrored in RTL: the cool light stays on the reading-end side.
  const cool = vec((isRTL ? 1 - LIGHTS.cool.x : LIGHTS.cool.x) * width, LIGHTS.cool.y * height);
  const warm = vec((isRTL ? 1 - LIGHTS.warm.x : LIGHTS.warm.x) * width, LIGHTS.warm.y * height);
  const coolR = LIGHTS.cool.r * width;
  const warmR = LIGHTS.warm.r * width;

  const navy = (
    <Rect x={0} y={0} width={width} height={navyHeight}>
      <LinearGradient
        start={vec(width * GRADIENT_X.start, 0)}
        end={vec(width * GRADIENT_X.end, height)}
        colors={colors.gradients.heroLive}
      />
    </Rect>
  );

  return (
    <Canvas style={styles.canvas} onSize={nativeSize} pointerEvents="none">
      <Group clip={clip}>
        {overCover ? (
          <Mask
            mode="alpha"
            mask={
              <Rect x={0} y={0} width={width} height={navyHeight}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, height * STAGE_COVER_SHARE)}
                  colors={[coverage(stage.coverScrim), coverage(1)]}
                />
              </Rect>
            }
          >
            {navy}
          </Mask>
        ) : (
          navy
        )}
        <Path path={art.dots} color={stage.dot} />
        <Path path={art.lines} style="stroke" strokeWidth={LINE_WIDTH} color={stage.line} />
        {art.sparks ? (
          <Path path={art.sparks} style="stroke" strokeWidth={SPARK_WIDTH} strokeCap="round" color={stage.spark} />
        ) : null}
        {SPARK_DOTS.map(dot => (
          <Circle
            key={dot.key}
            cx={dot.x * sx}
            cy={dot.y * sy}
            r={dot.r}
            color={dot.key === 'cool' ? stage.ring : stage.glowWarm}
            opacity={SPARK_DOT_ALPHA}
          />
        ))}
        <Circle c={cool} r={coolR} opacity={LIGHTS.cool.alpha}>
          <RadialGradient c={cool} r={coolR} colors={[stage.glowCool, clearOf(stage.glowCool)]} />
        </Circle>
        <Circle c={warm} r={warmR} opacity={LIGHTS.warm.alpha}>
          <RadialGradient c={warm} r={warmR} colors={[stage.glowWarm, clearOf(stage.glowWarm)]} />
        </Circle>
      </Group>
    </Canvas>
  );
};

export const MediaKitStageBackdrop = memo(MediaKitStageBackdropComponent);
