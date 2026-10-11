export interface TidePoint {
  /** Canvas x (left-based). */
  x: number;
  y: number;
  /** Distance from the reading start: positions RN overlays with `start`, so they flip in RTL. */
  fromStart: number;
}

export interface TideFrame {
  width: number;
  /** Highest point the line may reach (room for the value bubble above it). */
  top: number;
  /** Baseline: zero sits here and the area closes down to it. */
  base: number;
  /** Side margin of the first and last points. */
  inset: number;
  /** RTL: time runs from the reading start (right) to the reading end (left). */
  mirror: boolean;
}

export interface TideGeometry {
  points: TidePoint[];
  /** Smooth line through every point (SVG path data). */
  line: string;
  /** The line closed down to the baseline. */
  area: string;
}

/** Headroom over the tallest month, so its point never touches the top. */
const HEADROOM = 1.18;

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * A smooth earnings tide: horizontal cubic curves between month points (no overshoot below
 * the baseline), scaled from zero. A single month is a flat line across the canvas.
 */
export const buildTidePath = (
  values: readonly number[],
  { width, top, base, inset, mirror }: TideFrame,
): TideGeometry | null => {
  const inner = width - inset * 2;
  if (values.length === 0 || inner <= 0 || base <= top) return null;

  const series = values.length === 1 ? [values[0] ?? 0, values[0] ?? 0] : values;
  const max = Math.max(...series, 0) * HEADROOM || 1;
  const step = inner / (series.length - 1);

  const points = series.map((value, i) => {
    const fromStart = round(inset + step * i);
    return {
      x: mirror ? round(width - fromStart) : fromStart,
      y: round(base - (Math.max(value, 0) / max) * (base - top)),
      fromStart,
    };
  });

  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;

  let line = `M${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const cur = points[i];
    if (!prev || !cur) continue;
    const mid = round((prev.x + cur.x) / 2);
    line += ` C${mid} ${prev.y} ${mid} ${cur.y} ${cur.x} ${cur.y}`;
  }
  const area = `${line} L${last.x} ${base} L${first.x} ${base} Z`;

  return { points: values.length === 1 ? points.slice(1) : points, line, area };
};
