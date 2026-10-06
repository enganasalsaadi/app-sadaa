export interface SparklinePoint {
  x: number;
  y: number;
}

export interface SparklineGeometry {
  line: string;
  /** The line closed down to the baseline, for the soft fill under it. */
  area: string;
  /** Latest value (the end of the time axis), marked with a dot. */
  end: SparklinePoint;
}

export interface SparklineFrame {
  width: number;
  height: number;
  /** Keeps the stroke and end dot inside the canvas. */
  inset: number;
  /** RTL: time runs from the reading start (right) to the reading end (left). */
  mirror: boolean;
}

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * SVG paths for a trend line. The scale starts at 0 so equal values read as
 * "flat at their level", and all zeros sit on the baseline. A single value is a
 * flat line across the canvas.
 */
export const buildSparklinePath = (
  values: readonly number[],
  { width, height, inset, mirror }: SparklineFrame,
): SparklineGeometry | null => {
  const innerWidth = width - inset * 2;
  const innerHeight = height - inset * 2;
  if (values.length === 0 || innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  const series =
    values.length === 1 ? [values[0] ?? 0, values[0] ?? 0] : values;
  const max = Math.max(0, ...series);
  const min = Math.min(0, ...series);
  const span = max - min || 1;
  const step = innerWidth / (series.length - 1);

  const points = series.map((value, i) => {
    const x = inset + step * i;
    return {
      x: round(mirror ? width - x : x),
      y: round(inset + innerHeight - ((value - min) / span) * innerHeight),
    };
  });

  const first = points[0];
  const end = points[points.length - 1];
  if (!first || !end) {
    return null;
  }

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ');
  const baseline = round(height);
  const area = `${line} L${end.x} ${baseline} L${first.x} ${baseline} Z`;

  return { line, area, end };
};
