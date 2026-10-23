import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { AccessibilityActionEvent, LayoutChangeEvent, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Pause, Play } from 'lucide-react-native';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { formatTimecode } from '@/shared/utils';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { clamp } from './viewerGeometry';
import type { VideoState } from './types';

/** Screen-reader swipe up / down on the scrubber jumps this many seconds. */
const A11Y_STEP_S = 10;
const A11Y_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

export interface ViewerVideoBarProps {
  state: VideoState;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
}

/**
 * Play / pause and a scrubber: drag or tap anywhere on the track. Time runs left to right in both
 * languages (a timeline, not text).
 */
const ViewerVideoBarComponent: React.FC<ViewerVideoBarProps> = ({ state, onTogglePlay, onSeek }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [track, setTrack] = useState(0);
  const shown = useSharedValue(0);
  const dragging = useSharedValue(false);

  const styles = useStyles(
    ({ colors: palette, radii, sizes: size }): Record<'timeline' | 'track' | 'fill' | 'knob', ViewStyle> => ({
      // A timeline reads left to right whatever the language.
      timeline: { flex: 1, flexDirection: 'row', alignItems: 'center', direction: 'ltr' },
      track: {
        flex: 1,
        height: size.button.md,
        justifyContent: 'center',
      },
      fill: {
        height: size.progress.track,
        borderRadius: radii.full,
        backgroundColor: palette.viewer.accent,
      },
      knob: {
        width: size.dot.md * 2,
        height: size.dot.md * 2,
        borderRadius: radii.full,
        backgroundColor: palette.viewer.text,
        position: 'absolute',
      },
    }),
  );

  const progress = state.duration > 0 ? clamp(state.time / state.duration, 0, 1) : 0;

  useEffect(() => {
    if (!dragging.value) shown.value = progress;
  }, [dragging, progress, shown]);

  const scrub = useMemo(() => {
    const at = (x: number) => {
      'worklet';
      return track > 0 ? clamp(x / track, 0, 1) : 0;
    };
    const commit = (share: number) => onSeek(share * state.duration);
    const pan = Gesture.Pan()
      .minDistance(0)
      .onStart(event => {
        dragging.value = true;
        shown.value = at(event.x);
      })
      .onUpdate(event => {
        shown.value = at(event.x);
      })
      .onEnd(() => {
        runOnJS(commit)(shown.value);
      })
      .onFinalize(() => {
        dragging.value = false;
      });
    return pan;
  }, [dragging, onSeek, shown, state.duration, track]);

  const fill = useAnimatedStyle(() => ({ width: shown.value * track }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: shown.value * track - sizes.dot.md }],
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => setTrack(event.nativeEvent.layout.width), []);

  const onA11yAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const step = event.nativeEvent.actionName === 'increment' ? A11Y_STEP_S : -A11Y_STEP_S;
      onSeek(clamp(state.time + step, 0, state.duration));
    },
    [onSeek, state.duration, state.time],
  );

  const PlayIcon = state.paused ? Play : Pause;

  return (
    <Box row align="center" gap="md" px="lg">
      <Pressable
        onPress={onTogglePlay}
        scaleOnPress
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="full"
        bg={colors.viewer.accent}
        align="center"
        justify="center"
        accessibilityRole="button"
        accessibilityLabel={state.paused ? t('files.viewer.play') : t('files.viewer.pause')}
      >
        <PlayIcon size={sizes.icon.sm} color={colors.viewer.onAccent} strokeWidth={iconStroke.bold} fill={colors.viewer.onAccent} />
      </Pressable>
      <Box style={styles.timeline}>
        <Text variant="amountSmall" color={colors.viewer.text}>
          {formatTimecode(state.time)}
        </Text>
        <GestureDetector gesture={scrub}>
          <Box
            style={styles.track}
            mx="md"
            onLayout={onLayout}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={t('files.viewer.seek')}
            accessibilityValue={{ min: 0, max: Math.round(state.duration), now: Math.round(state.time) }}
            accessibilityActions={A11Y_ACTIONS}
            onAccessibilityAction={onA11yAction}
          >
            <Box height={sizes.progress.track} borderRadius="full" bg={colors.viewer.track} justify="center">
              <Animated.View style={[styles.fill, fill]} />
            </Box>
            <Animated.View style={[styles.knob, knob]} pointerEvents="none" />
          </Box>
        </GestureDetector>
        <Text variant="amountSmall" color={colors.viewer.muted}>
          {formatTimecode(state.duration)}
        </Text>
      </Box>
    </Box>
  );
};

export const ViewerVideoBar = memo(ViewerVideoBarComponent);
