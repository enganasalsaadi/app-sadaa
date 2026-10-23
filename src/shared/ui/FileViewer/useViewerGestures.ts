import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { motion } from '@/core/theme';
import {
  DISMISS_SHARE,
  DISMISS_VELOCITY,
  DOUBLE_TAP_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_EPSILON,
  clamp,
  pageStep,
  panLimit,
  rubberBand,
  zoomAround,
  type Size,
} from './viewerGeometry';

/** Pinch overshoot allowed before release springs it back into range. */
const PINCH_UNDER = 0.75;
const PINCH_OVER = 1.15;
/** Edge pages follow a swipe that has nowhere to go this much. */
const EDGE_RESIST = 0.3;
/** Movement before a swipe at ×1 commits to paging or dismissing. */
const AXIS_LOCK = 10;
/** How far a released pan keeps gliding (velocity × this, seconds). */
const GLIDE = 0.12;
const SPRING = motion.spring;

type PanMode = 'idle' | 'pan' | 'page' | 'dismiss';

export interface ViewerGestureOptions {
  stage: Size;
  count: number;
  initialIndex: number;
  /** 1 = next file comes from the right (LTR), -1 = from the left (RTL). */
  direction: 1 | -1;
  /** Swipes, taps and closing on the stage; off for a PDF (it handles its own touches natively). */
  enabled: boolean;
  /** Photos and videos zoom (a card for a missing or undrawable file only pages). */
  zoomable: boolean;
  /** The active file's fitted box (pan limits). */
  content: SharedValue<Size>;
  reduceMotion: boolean;
  onPage: (index: number) => void;
  onDismiss: () => void;
  onToggleChrome: () => void;
  /** A gesture started / ended (the minimap shows while the user handles the file). */
  onActive: (active: boolean) => void;
}

/**
 * Every touch on the stage in one detector: pinch around the fingers (1–5×), pan while zoomed
 * (rubber band at the edges), swipe between files only at ×1, swipe down to close, double-tap
 * to zoom at the tap, single tap to hide the controls. Runs on the UI thread; React hears only
 * page turns, closes and chrome toggles.
 */
export const useViewerGestures = ({
  stage,
  count,
  initialIndex,
  direction,
  enabled,
  zoomable,
  content,
  reduceMotion,
  onPage,
  onDismiss,
  onToggleChrome,
  onActive,
}: ViewerGestureOptions) => {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pagerX = useSharedValue(0);
  const dismissY = useSharedValue(0);
  const index = useSharedValue(initialIndex);
  const start = useSharedValue({ scale: 1, tx: 0, ty: 0, fx: 0, fy: 0 });
  const mode = useSharedValue<PanMode>('idle');

  const { width: W, height: H } = stage;

  const go = useCallback(
    (value: SharedValue<number>, to: number) => {
      'worklet';
      value.value = reduceMotion ? to : withSpring(to, SPRING);
    },
    [reduceMotion],
  );

  /** Springs scale and translation into range for `target`. */
  const settle = useCallback(
    (target: number, x: number, y: number) => {
      'worklet';
      const next = target <= ZOOM_EPSILON ? MIN_ZOOM : clamp(target, MIN_ZOOM, MAX_ZOOM);
      const limX = panLimit(content.value.width, W, next);
      const limY = panLimit(content.value.height, H, next);
      go(scale, next);
      go(tx, next === MIN_ZOOM ? 0 : clamp(x, -limX, limX));
      go(ty, next === MIN_ZOOM ? 0 : clamp(y, -limY, limY));
    },
    [H, W, content, go, scale, tx, ty],
  );

  /** Back to the whole file without animating (a new file took the stage). */
  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = MIN_ZOOM;
    tx.value = 0;
    ty.value = 0;
  }, [scale, tx, ty]);

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .enabled(zoomable)
      .onStart(event => {
        start.value = {
          scale: scale.value,
          tx: tx.value,
          ty: ty.value,
          fx: event.focalX - W / 2,
          fy: event.focalY - H / 2,
        };
        runOnJS(onActive)(true);
      })
      .onUpdate(event => {
        const from = start.value;
        const next = clamp(from.scale * event.scale, MIN_ZOOM * PINCH_UNDER, MAX_ZOOM * PINCH_OVER);
        const fx = event.focalX - W / 2;
        const fy = event.focalY - H / 2;
        // The point under the fingers stays put; moving both fingers drags along.
        tx.value = zoomAround(from.fx, from.tx, from.scale, next) + (fx - from.fx);
        ty.value = zoomAround(from.fy, from.ty, from.scale, next) + (fy - from.fy);
        scale.value = next;
      })
      .onEnd(() => {
        settle(scale.value, tx.value, ty.value);
        runOnJS(onActive)(false);
      });

    const pan = Gesture.Pan()
      .enabled(enabled)
      .minDistance(6)
      .averageTouches(true)
      .onStart(() => {
        start.value = { scale: scale.value, tx: tx.value, ty: ty.value, fx: 0, fy: 0 };
        mode.value = scale.value > ZOOM_EPSILON ? 'pan' : 'idle';
        if (mode.value === 'pan') runOnJS(onActive)(true);
      })
      .onUpdate(event => {
        if (mode.value === 'pan') {
          const limX = panLimit(content.value.width, W, scale.value);
          const limY = panLimit(content.value.height, H, scale.value);
          tx.value = rubberBand(start.value.tx + event.translationX, limX);
          ty.value = rubberBand(start.value.ty + event.translationY, limY);
          return;
        }
        // Two fingers at ×1 belong to the pinch.
        if (event.numberOfPointers > 1) return;
        if (mode.value === 'idle') {
          const dx = Math.abs(event.translationX);
          const dy = Math.abs(event.translationY);
          if (Math.max(dx, dy) < AXIS_LOCK) return;
          mode.value = dx > dy ? 'page' : 'dismiss';
        }
        if (mode.value === 'page') {
          const forward = -event.translationX * direction;
          const atEdge =
            (index.value <= 0 && forward < 0) || (index.value >= count - 1 && forward > 0);
          pagerX.value = atEdge ? event.translationX * EDGE_RESIST : event.translationX;
        } else {
          dismissY.value = event.translationY > 0 ? event.translationY : event.translationY * EDGE_RESIST;
        }
      })
      .onEnd(event => {
        const current = mode.value;
        mode.value = 'idle';
        if (current === 'pan') {
          settle(scale.value, tx.value + event.velocityX * GLIDE, ty.value + event.velocityY * GLIDE);
          runOnJS(onActive)(false);
          return;
        }
        if (current === 'page') {
          const step = pageStep(pagerX.value, event.velocityX, W, direction);
          const next = clamp(index.value + step, 0, count - 1);
          if (next === index.value) {
            go(pagerX, 0);
            return;
          }
          const land = () => {
            'worklet';
            index.value = next;
            pagerX.value = 0;
            resetZoom();
            runOnJS(onPage)(next);
          };
          const target = -direction * (next - index.value) * W;
          if (reduceMotion) {
            land();
            return;
          }
          pagerX.value = withTiming(target, { duration: motion.duration.base }, finished => {
            if (finished) land();
          });
          return;
        }
        if (current === 'dismiss') {
          if (dismissY.value > H * DISMISS_SHARE || event.velocityY > DISMISS_VELOCITY) {
            dismissY.value = withTiming(H, { duration: motion.duration.fast }, () => {
              runOnJS(onDismiss)();
            });
          } else {
            go(dismissY, 0);
          }
        }
      });

    const doubleTap = Gesture.Tap()
      .enabled(zoomable)
      .numberOfTaps(2)
      .onEnd(event => {
        if (scale.value > ZOOM_EPSILON) {
          settle(MIN_ZOOM, 0, 0);
          return;
        }
        const fx = event.x - W / 2;
        const fy = event.y - H / 2;
        settle(DOUBLE_TAP_ZOOM, zoomAround(fx, 0, 1, DOUBLE_TAP_ZOOM), zoomAround(fy, 0, 1, DOUBLE_TAP_ZOOM));
        runOnJS(onActive)(false);
      });

    const singleTap = Gesture.Tap()
      .enabled(enabled)
      .requireExternalGestureToFail(doubleTap)
      .onEnd(() => {
        runOnJS(onToggleChrome)();
      });

    return Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, singleTap));
  }, [
    H,
    W,
    content,
    count,
    direction,
    dismissY,
    enabled,
    go,
    index,
    mode,
    onActive,
    onDismiss,
    onPage,
    onToggleChrome,
    pagerX,
    reduceMotion,
    resetZoom,
    scale,
    settle,
    start,
    tx,
    ty,
    zoomable,
  ]);

  /** ± on the zoom pill: around the centre of what's shown. */
  const zoomBy = useCallback(
    (delta: number) => {
      const next = clamp(scale.value + delta, MIN_ZOOM, MAX_ZOOM);
      const ratio = next / scale.value;
      settle(next, tx.value * ratio, ty.value * ratio);
    },
    [scale, settle, tx, ty],
  );

  /** The filmstrip picked a file: no slide, the stage swaps. */
  const jumpTo = useCallback(
    (next: number) => {
      index.value = next;
      pagerX.value = 0;
      resetZoom();
    },
    [index, pagerX, resetZoom],
  );

  return { gesture, scale, tx, ty, pagerX, dismissY, index, zoomBy, jumpTo };
};
