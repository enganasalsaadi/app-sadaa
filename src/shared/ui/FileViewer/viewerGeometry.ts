/** Pinch range: whole file at 1, close detail at 5. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;
/** Double-tap lands here (around the tapped point). */
export const DOUBLE_TAP_ZOOM = 2.5;
/** ± on the zoom pill. */
export const ZOOM_STEP = 0.5;
/** Below this the file counts as unzoomed: swipes page and dismiss instead of panning. */
export const ZOOM_EPSILON = 1.01;
/** Share of the stage height a downward swipe needs to close. */
export const DISMISS_SHARE = 0.18;
export const DISMISS_VELOCITY = 900;
/** Share of the width (or a flick) that turns the page. */
export const PAGE_SHARE = 0.22;
export const PAGE_VELOCITY = 600;
/** How far past an edge the content follows the finger (rubber band). */
const RUBBER = 0.35;

export interface Size {
  width: number;
  height: number;
}

/** The file's box when it fits the stage whole (`contain`). Unknown shape → the stage. */
export const fitSize = (natural: Size | null, stage: Size): Size => {
  'worklet';
  if (!natural || natural.width <= 0 || natural.height <= 0) return stage;
  const ratio = Math.min(stage.width / natural.width, stage.height / natural.height);
  return { width: natural.width * ratio, height: natural.height * ratio };
};

/** How far the zoomed content may move from centre on one axis before its edge shows. */
export const panLimit = (content: number, stage: number, scale: number): number => {
  'worklet';
  return Math.max(0, (content * scale - stage) / 2);
};

export const clamp = (value: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

/** Past `limit` the content lags behind the finger instead of stopping dead. */
export const rubberBand = (value: number, limit: number): number => {
  'worklet';
  if (value > limit) return limit + (value - limit) * RUBBER;
  if (value < -limit) return -limit + (value + limit) * RUBBER;
  return value;
};

/**
 * Translation that keeps the point under the fingers still while the scale goes from `fromScale`
 * to `toScale`. `focal` and `translate` are measured from the stage centre.
 */
export const zoomAround = (focal: number, translate: number, fromScale: number, toScale: number): number => {
  'worklet';
  return focal - ((focal - translate) * toScale) / fromScale;
};

/** Which page a released swipe settles on: -1 back, 0 stay, 1 forward (reading order). */
export const pageStep = (offset: number, velocity: number, width: number, direction: 1 | -1): -1 | 0 | 1 => {
  'worklet';
  const forward = -offset * direction;
  const flick = -velocity * direction;
  if (forward > width * PAGE_SHARE || flick > PAGE_VELOCITY) return 1;
  if (forward < -width * PAGE_SHARE || flick < -PAGE_VELOCITY) return -1;
  return 0;
};
