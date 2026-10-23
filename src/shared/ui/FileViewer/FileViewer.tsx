import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Modal, StatusBar, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { ViewerDock } from './ViewerDock';
import { ViewerDocument } from './ViewerDocument';
import { ViewerFilmstrip } from './ViewerFilmstrip';
import { ViewerImage } from './ViewerImage';
import { ViewerMinimap } from './ViewerMinimap';
import { ViewerPdf } from './ViewerPdf';
import { ViewerPdfCounter } from './ViewerPdfCounter';
import { ViewerPdfPages } from './ViewerPdfPages';
import { ViewerPdfRail } from './ViewerPdfRail';
import { ViewerSlot } from './ViewerSlot';
import { ViewerTopBar } from './ViewerTopBar';
import { ViewerVideo } from './ViewerVideo';
import { ViewerVideoBar } from './ViewerVideoBar';
import { ViewerZoomPill } from './ViewerZoomPill';
import { stageKindOf, useFileViewerState } from './useFileViewerState';
import type { FileViewerProps } from './types';

/** How small the stage shrinks as a swipe down closes the viewer. */
const DISMISS_SHRINK = 0.25;
/** The controls are gone once a closing swipe covers this share of the height. */
const CHROME_FADE_SHARE = 0.2;

const SUPPORTED_ORIENTATIONS = ['portrait', 'landscape'] as const;

type BackHandlerRef = React.RefObject<(() => void) | null>;

interface BodyProps extends Omit<FileViewerProps, 'visible'> {
  /** The modal's Android back press asks the body first (an open panel closes before the viewer). */
  backRef: BackHandlerRef;
}

const FileViewerBody: React.FC<BodyProps> = ({ backRef, ...props }) => {
  const { files, saveable = true } = props;
  const insets = useSafeAreaInsets();
  const { isRTL } = useTheme();
  const vm = useFileViewerState(props);
  const { gestures, stage, onTopLayout, onBottomLayout, onRequestClose } = vm;
  const direction = isRTL ? -1 : 1;

  useEffect(() => {
    backRef.current = onRequestClose;
    return () => {
      backRef.current = null;
    };
  }, [backRef, onRequestClose]);

  const styles = useStyles(
    ({ colors: palette, spacing: space, zIndices }): Record<'root' | 'backdrop' | 'top' | 'bottom' | 'rail' | 'minimap' | 'panel', ViewStyle> => ({
      root: { flex: 1 },
      backdrop: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, backgroundColor: palette.viewer.backdrop },
      top: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        paddingTop: insets.top + space.sm,
        gap: space.md,
        alignItems: 'center',
        zIndex: zIndices.overlay,
      },
      bottom: {
        position: 'absolute',
        bottom: 0,
        start: 0,
        end: 0,
        paddingBottom: insets.bottom + space.md,
        gap: space.lg,
        zIndex: zIndices.overlay,
      },
      rail: {
        position: 'absolute',
        end: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: zIndices.overlay,
      },
      minimap: {
        position: 'absolute',
        top: vm.chromeHeights.top + space.md,
        end: space.lg,
        zIndex: zIndices.overlay,
      },
      panel: { position: 'absolute', start: 0, end: 0, bottom: 0, zIndex: zIndices.modal },
    }),
    [insets.top, insets.bottom, vm.chromeHeights.top],
  );

  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(gestures.dismissY.value, [0, stage.height], [1, 0], 'clamp'),
  }));
  const stageMotion = useAnimatedStyle(() => ({
    transform: [
      { translateY: gestures.dismissY.value },
      { scale: interpolate(gestures.dismissY.value, [0, stage.height], [1, 1 - DISMISS_SHRINK], 'clamp') },
    ],
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity:
      vm.chromeShown.value * interpolate(gestures.dismissY.value, [0, stage.height * CHROME_FADE_SHARE], [1, 0], 'clamp'),
  }));

  const onTop = useCallback(
    (event: LayoutChangeEvent) => onTopLayout(event.nativeEvent.layout.height),
    [onTopLayout],
  );
  const onBottom = useCallback(
    (event: LayoutChangeEvent) => onBottomLayout(event.nativeEvent.layout.height),
    [onBottomLayout],
  );

  const { file, active, kind } = vm;
  if (!file || !active) return null;

  const neighbours = [vm.index - 1, vm.index, vm.index + 1].filter(i => i >= 0 && i < files.length);
  const touchable = vm.chrome ? 'box-none' : 'none';
  const naturalOfActive = vm.naturals[file.id];
  const activeUri = active.url;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" hidden={!vm.chrome} animated />
      <Animated.View style={[styles.backdrop, backdrop]} />

      <GestureDetector gesture={gestures.gesture}>
        <Animated.View style={[StyleSheet.absoluteFill, stageMotion]}>
          {neighbours.map(position => {
            const item = files[position];
            if (!item) return null;
            const isActive = position === vm.index;
            const itemKind = stageKindOf(item);
            return (
              <ViewerSlot
                key={item.id}
                position={position}
                stage={stage}
                direction={direction}
                index={gestures.index}
                pagerX={gestures.pagerX}
                scale={gestures.scale}
                tx={gestures.tx}
                ty={gestures.ty}
              >
                {itemKind === 'image' ? (
                  <ViewerImage
                    id={item.id}
                    uri={vm.uriOf(item)}
                    stage={stage}
                    onNatural={vm.onNatural}
                    onBroken={vm.onBroken}
                  />
                ) : itemKind === 'video' && isActive ? (
                  <ViewerVideo id={item.id} uri={vm.uriOf(item)} player={vm.video} onBroken={vm.onBroken} />
                ) : itemKind === 'pdf' && isActive ? (
                  <ViewerPdf
                    file={active}
                    refreshUrl={props.refreshUrl}
                    pdfRef={vm.pdfRef}
                    insetTop={vm.chromeHeights.top}
                    insetBottom={vm.chromeHeights.bottom}
                    onState={vm.onPdfState}
                    onTap={vm.toggleChrome}
                  />
                ) : (
                  <ViewerDocument file={item} variant={itemKind === 'document' ? 'unsupported' : 'preview'} />
                )}
              </ViewerSlot>
            );
          })}
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.top, chromeStyle]} pointerEvents={touchable} onLayout={onTop}>
        <ViewerTopBar
          name={file.name}
          subtitle={vm.subtitle}
          onClose={props.onClose}
          mute={kind === 'video' ? { muted: vm.video.state.muted, onToggle: vm.video.toggleMute } : null}
        />
        {kind === 'pdf' ? <ViewerPdfCounter state={vm.pdf} /> : null}
        {(kind === 'image' || kind === 'video') && activeUri ? (
          <ViewerZoomPill zoom={vm.zoom} onZoomIn={vm.zoomIn} onZoomOut={vm.zoomOut} />
        ) : null}
      </Animated.View>

      {kind === 'image' && activeUri && naturalOfActive ? (
        <Box style={styles.minimap} pointerEvents="none">
          <ViewerMinimap
            uri={activeUri}
            natural={naturalOfActive}
            stage={stage}
            content={vm.content}
            scale={gestures.scale}
            tx={gestures.tx}
            ty={gestures.ty}
            awake={vm.awake}
          />
        </Box>
      ) : null}

      {kind === 'pdf' ? (
        <Animated.View style={[styles.rail, chromeStyle]} pointerEvents={touchable}>
          <ViewerPdfRail page={vm.pdf.page} pages={vm.pdf.pages} onPage={vm.goToPage} />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.bottom, chromeStyle]} pointerEvents={touchable} onLayout={onBottom}>
        {kind === 'video' && activeUri ? (
          <ViewerVideoBar state={vm.video.state} onTogglePlay={vm.video.togglePlay} onSeek={vm.video.seek} />
        ) : null}
        <ViewerFilmstrip files={files} index={vm.index} uriOf={vm.uriOf} onPick={vm.jump} />
        {saveable ? <ViewerDock save={vm.save} third={vm.third} /> : null}
      </Animated.View>

      {vm.pagesOpen && kind === 'pdf' ? (
        <Box style={styles.panel}>
          <ViewerPdfPages pages={vm.pdf.pages} page={vm.pdf.page} onPick={vm.goToPage} onClose={vm.closePages} />
        </Box>
      ) : null}
    </GestureHandlerRootView>
  );
};

/**
 * The one full-screen viewer for every file in the app: photos and videos zoom (pinch 1–5×,
 * double-tap, pan), PDFs read in-app page by page, anything else opens in another app. Swipe
 * between files at ×1, swipe down to close, tap to hide the controls. Save goes to Photos /
 * Downloads / Files through the app's download queue.
 */
const FileViewerComponent: React.FC<FileViewerProps> = ({ visible, ...body }) => {
  const backRef = useRef<(() => void) | null>(null);
  const { onClose } = body;
  const onRequestClose = useCallback(() => (backRef.current ?? onClose)(), [onClose]);
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      supportedOrientations={SUPPORTED_ORIENTATIONS}
      onRequestClose={onRequestClose}
    >
      {visible && body.files.length > 0 ? <FileViewerBody {...body} backRef={backRef} /> : null}
    </Modal>
  );
};

export const FileViewer = memo(FileViewerComponent);
