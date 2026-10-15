import React, { memo, useCallback, useMemo, useState } from 'react';
import { Vibration, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { formatTimecode } from '../../../utils/dealDrafts';
import type { ReviewPin } from '../hooks/useDealDraftReviewScreen';

const TICKS = 56;
const TICK_GAP = moderateScale(2);
const TICK_MIN = moderateScale(4);
const TICK_SPAN = moderateScale(18);
const TRACK = moderateScale(30);
const PLAYHEAD_W = moderateScale(3);
const PIN = moderateScale(24);
const PIN_SLOP = moderateScale(8);
const LONG_PRESS_MS = 350;
/** A step through the video for screen readers. */
const A11Y_STEP_S = 5;
const HASH_MOD = 1_000_003;
const TICK_IDS = Array.from({ length: TICKS }, (_, tick) => `tick-${tick}`);

/** The same file always draws the same ticks (a texture, not a waveform: no audio is read). */
const tickHeights = (seed: string): number[] => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % HASH_MOD;
  return TICK_IDS.map((_, tick) => {
    const wave = Math.abs(Math.sin((tick + (hash % 97)) * 0.7)) * 0.65 + Math.abs(Math.sin(tick * 0.23 + hash)) * 0.35;
    return TICK_MIN + wave * TICK_SPAN;
  });
};

export interface ReviewScrubberProps {
  fileId: string;
  time: number;
  duration: number;
  /** This file's pins with a second. */
  pins: ReviewPin[];
  onSeek: (seconds: number) => void;
  /** Long-press: a note at that second. */
  onPinAt: (seconds: number) => void;
}

const Ticks = memo<{ heights: number[]; played: number }>(({ heights, played }) => {
  const { colors } = useTheme();
  const sized = useMemo(() => heights.map(height => ({ height })), [heights]);
  const styles = useStyles(
    ({ radii }): Record<'row' | 'tick' | 'played' | 'idle', ViewStyle> => ({
      row: { flexDirection: 'row', alignItems: 'center', gap: TICK_GAP, height: TRACK },
      tick: { flex: 1, borderRadius: radii.xs },
      played: { backgroundColor: colors.draft.tickPlayed },
      idle: { backgroundColor: colors.draft.tick },
    }),
    [colors.draft.tick, colors.draft.tickPlayed],
  );
  return (
    <Box style={styles.row} pointerEvents="none">
      {TICK_IDS.map((id, tick) => (
        <Box key={id} style={[styles.tick, tick < played ? styles.played : styles.idle, sized[tick]]} />
      ))}
    </Box>
  );
});

const PinDrop = memo<{
  pin: ReviewPin;
  number: number;
  offset: ViewStyle;
  style: ViewStyle;
  innerStyle: ViewStyle;
  onSeek: (seconds: number) => void;
}>(({ pin, number, offset, style, innerStyle, onSeek }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const seek = useCallback(() => onSeek(pin.atSecond ?? 0), [onSeek, pin.atSecond]);
  const placed = useMemo((): ViewStyle => ({ ...style, ...offset }), [offset, style]);
  return (
    <Pressable
      style={placed}
      onPress={seek}
      hitSlop={PIN_SLOP}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.drafts.review.pinMarker', { time: formatTimecode(pin.atSecond ?? 0) })}
    >
      <Box style={innerStyle}>
        <Text variant="caption" color={colors.draft.onPin}>
          {String(number)}
        </Text>
      </Box>
    </Pressable>
  );
});

/**
 * The review stage's timeline (approved «طاولة المونتاج»): ticks that fill teal as the video plays,
 * a white playhead, an amber drop for each note. Tap or drag to seek; press and hold to pin a note
 * at that second (light tap). Time runs from the start edge, so it flows right-to-left in Arabic.
 */
const ReviewScrubberComponent: React.FC<ReviewScrubberProps> = ({ fileId, time, duration, pins, onSeek, onPinAt }) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const [width, setWidth] = useState(0);
  const heights = useMemo(() => tickHeights(fileId), [fileId]);
  const share = duration > 0 ? Math.min(1, time / duration) : 0;

  const secondsAt = useCallback(
    (x: number) => {
      if (width <= 0 || duration <= 0) return 0;
      const fromStart = isRTL ? width - x : x;
      return Math.min(duration, Math.max(0, (fromStart / width) * duration));
    },
    [duration, isRTL, width],
  );

  const gesture = useMemo(() => {
    const scrub = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onUpdate(event => onSeek(secondsAt(event.x)));
    const hold = Gesture.LongPress()
      .runOnJS(true)
      .minDuration(LONG_PRESS_MS)
      .onStart(event => {
        const at = secondsAt(event.x);
        Vibration.vibrate(HAPTIC_TAP_MS);
        onSeek(at);
        onPinAt(at);
      });
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(event => onSeek(secondsAt(event.x)));
    return Gesture.Race(scrub, Gesture.Exclusive(hold, tap));
  }, [onPinAt, onSeek, secondsAt]);

  const onLayout = useCallback((event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width), []);
  const headOffset = useMemo(() => ({ start: share * width }), [share, width]);
  const pinOffsets = useMemo(
    () =>
      pins.map(pin => ({
        start: duration > 0 && pin.atSecond !== null ? (Math.min(pin.atSecond, duration) / duration) * width : 0,
      })),
    [duration, pins, width],
  );
  const step = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'increment') onSeek(Math.min(duration, time + A11Y_STEP_S));
      if (event.nativeEvent.actionName === 'decrement') onSeek(Math.max(0, time - A11Y_STEP_S));
      if (event.nativeEvent.actionName === 'longpress') onPinAt(time);
    },
    [duration, onPinAt, onSeek, time],
  );

  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'track' | 'playhead' | 'pin' | 'pinInner', ViewStyle> => ({
      track: { height: TRACK + PIN / 2, justifyContent: 'flex-end' },
      playhead: {
        position: 'absolute',
        bottom: -spacing.xs,
        width: PLAYHEAD_W,
        height: TRACK + spacing.sm,
        marginStart: -PLAYHEAD_W / 2,
        borderRadius: radii.full,
        backgroundColor: colors.draft.playhead,
      },
      pin: {
        position: 'absolute',
        top: 0,
        width: PIN,
        height: PIN,
        marginStart: -PIN / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopStartRadius: radii.full,
        borderTopEndRadius: radii.full,
        borderBottomStartRadius: radii.full,
        transform: [{ rotate: isRTL ? '45deg' : '-45deg' }],
        backgroundColor: colors.draft.pin,
        ...shadows.card,
      },
      pinInner: { transform: [{ rotate: isRTL ? '-45deg' : '45deg' }] },
    }),
    [colors.draft.pin, colors.draft.playhead, isRTL],
  );

  return (
    <Box gap="xs">
      <GestureDetector gesture={gesture}>
        <Box
          style={styles.track}
          onLayout={onLayout}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('marketplace.deals.drafts.review.scrubber', {
            time: formatTimecode(time),
            total: formatTimecode(duration),
          })}
          accessibilityHint={t('marketplace.deals.drafts.review.scrubberHint')}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }, { name: 'longpress' }]}
          onAccessibilityAction={step}
        >
          <Ticks heights={heights} played={Math.round(share * TICKS)} />
          <Box style={[styles.playhead, headOffset]} pointerEvents="none" />
          {pins.map((pin, index) =>
            pin.atSecond === null || duration <= 0 ? null : (
              <PinDrop
                key={pin.key}
                pin={pin}
                number={index + 1}
                offset={pinOffsets[index] ?? headOffset}
                style={styles.pin}
                innerStyle={styles.pinInner}
                onSeek={onSeek}
              />
            ),
          )}
        </Box>
      </GestureDetector>
      <Box row justify="space-between">
        <Text variant="caption" color={colors.text.onBrandMuted}>
          {formatTimecode(time)}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted}>
          {formatTimecode(duration)}
        </Text>
      </Box>
    </Box>
  );
};

export const ReviewScrubber = memo(ReviewScrubberComponent);
