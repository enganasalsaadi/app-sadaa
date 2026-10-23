import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { AccessibilityActionEvent, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { clamp } from './viewerGeometry';

export interface ViewerPdfRailProps {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}

const A11Y_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

/**
 * A slim rail on the reading-end edge: the thumb sits where the page is in the document; drag it
 * to fly through a long PDF (the page lands on release, a bubble says which).
 */
const ViewerPdfRailComponent: React.FC<ViewerPdfRailProps> = ({ page, pages, onPage }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const height = sizes.viewer.rail;
  const thumb = sizes.viewer.railThumb;
  const span = height - thumb;
  const shown = useSharedValue(0);
  const dragging = useSharedValue(false);
  const bubble = useSharedValue(0);
  const [preview, setPreview] = useState<number | null>(null);

  const styles = useStyles(
    ({ colors: palette, radii, sizes: size }): Record<'rail' | 'thumb' | 'bubble', ViewStyle> => ({
      rail: { width: size.iconButton.md, height: size.viewer.rail, alignItems: 'center' },
      thumb: {
        position: 'absolute',
        width: size.dot.md,
        height: size.viewer.railThumb,
        borderRadius: radii.full,
        backgroundColor: palette.viewer.accent,
      },
      bubble: { position: 'absolute', end: size.iconButton.md },
    }),
  );

  const share = pages > 1 ? (page - 1) / (pages - 1) : 0;

  useEffect(() => {
    if (!dragging.value) shown.value = share;
  }, [dragging, share, shown]);

  const pageAt = useCallback(
    (value: number) => {
      'worklet';
      return Math.round(value * (pages - 1)) + 1;
    },
    [pages],
  );

  const drag = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          dragging.value = true;
          bubble.value = 0;
        })
        .onStart(event => {
          shown.value = clamp((event.y - thumb / 2) / span, 0, 1);
        })
        .onUpdate(event => {
          shown.value = clamp((event.y - thumb / 2) / span, 0, 1);
          // React hears only page changes, not every frame.
          const next = pageAt(shown.value);
          if (next !== bubble.value) {
            bubble.value = next;
            runOnJS(setPreview)(next);
          }
        })
        .onEnd(() => {
          runOnJS(onPage)(pageAt(shown.value));
        })
        .onFinalize(() => {
          dragging.value = false;
          runOnJS(setPreview)(null);
        }),
    [bubble, dragging, onPage, pageAt, shown, span, thumb],
  );

  const place = useAnimatedStyle(() => ({ transform: [{ translateY: shown.value * span }] }));

  const onA11yAction = useCallback(
    (event: AccessibilityActionEvent) =>
      onPage(clamp(page + (event.nativeEvent.actionName === 'increment' ? 1 : -1), 1, pages)),
    [onPage, page, pages],
  );

  if (pages < 2) return null;

  return (
    <GestureDetector gesture={drag}>
      <Box
        style={styles.rail}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('files.viewer.goToPage')}
        accessibilityValue={{ min: 1, max: pages, now: page }}
        accessibilityActions={A11Y_ACTIONS}
        onAccessibilityAction={onA11yAction}
      >
        <Box width={sizes.progress.track} height={height} borderRadius="full" bg={colors.viewer.track} />
        <Animated.View style={[styles.thumb, place]}>
          {preview !== null ? (
            <Box style={styles.bubble} px="md" py="xs" borderRadius="full" bg={colors.viewer.accent}>
              <Text variant="amountSmall" color={colors.viewer.onAccent}>
                {preview}
              </Text>
            </Box>
          ) : null}
        </Animated.View>
      </Box>
    </GestureDetector>
  );
};

export const ViewerPdfRail = memo(ViewerPdfRailComponent);
