import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PdfRef } from 'react-native-pdf';
import {
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gauge, LayoutGrid, Maximize2 } from 'lucide-react-native';
import { isPdf } from '@/core/download';
import { formatNumber } from '@/core/i18n';
import { motion, useTheme } from '@/core/theme';
import { formatFileSize } from '@/shared/utils';
import { useViewerGestures } from './useViewerGestures';
import { useViewerSave } from './useViewerSave';
import { useViewerVideo } from './useViewerVideo';
import { ZOOM_STEP, clamp, fitSize, type Size } from './viewerGeometry';
import type { ViewerDockAction } from './ViewerDock';
import type { FileViewerProps, PdfState, ViewerFile } from './types';

/** The minimap stays this long after the fingers lift. */
const MINIMAP_LINGER_MS = 1000;
const PDF_EMPTY: PdfState = { page: 0, pages: 0, scale: 1 };

export type ViewerStageKind = 'image' | 'video' | 'pdf' | 'document';

export const stageKindOf = (file: ViewerFile): ViewerStageKind => {
  if (file.kind !== 'document') return file.kind;
  return isPdf(file.mime) ? 'pdf' : 'document';
};

type BodyProps = Omit<FileViewerProps, 'visible'>;

/** Everything the open viewer tracks: the active file, links, zoom, chrome, the PDF and the video. */
export const useFileViewerState = ({
  files,
  initialIndex = 0,
  onClose,
  onIndexChange,
  refreshUrl,
}: BodyProps) => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const stage = useMemo<Size>(() => ({ width, height }), [width, height]);

  const [index, setIndex] = useState(() => clamp(initialIndex, 0, Math.max(0, files.length - 1)));
  const [chrome, setChrome] = useState(true);
  const [urls, setUrls] = useState<Readonly<Record<string, string | null>>>({});
  const [naturals, setNaturals] = useState<Readonly<Record<string, Size>>>({});
  const [pdf, setPdf] = useState<PdfState>(PDF_EMPTY);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [chromeHeights, setChromeHeights] = useState({ top: 0, bottom: 0 });
  const pdfRef = useRef<PdfRef | null>(null);

  const file = files[index] ?? files[0];
  const kind: ViewerStageKind = file ? stageKindOf(file) : 'document';

  const uriOf = useCallback(
    (target: ViewerFile): string | null => (target.id in urls ? (urls[target.id] ?? null) : target.url),
    [urls],
  );

  // The active file with its freshest link: the PDF cache and the save queue read this one.
  const active = useMemo<ViewerFile | null>(() => (file ? { ...file, url: uriOf(file) } : null), [file, uriOf]);

  /** A signed link stopped working: ask the owner once. `false` = keep the error. */
  const onBroken = useCallback(
    async (id: string): Promise<boolean> => {
      if (!refreshUrl) return false;
      try {
        const fresh = await refreshUrl(id);
        setUrls(current => ({ ...current, [id]: fresh }));
        return fresh !== null;
      } catch {
        return false;
      }
    },
    [refreshUrl],
  );

  const onNatural = useCallback((id: string, size: Size) => {
    setNaturals(current => (current[id] ? current : { ...current, [id]: size }));
  }, []);

  const video = useViewerVideo(kind === 'video' && file ? file.id : null);
  const save = useViewerSave(active, refreshUrl);

  const content = useSharedValue<Size>(stage);
  const natural = file ? (kind === 'video' ? video.natural : (naturals[file.id] ?? null)) : null;
  useEffect(() => {
    content.value = fitSize(natural, stage);
  }, [content, natural, stage]);

  // The minimap: awake while a gesture runs, then lingers a moment.
  const awake = useSharedValue(0);
  const linger = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onActive = useCallback(
    (on: boolean) => {
      if (linger.current) clearTimeout(linger.current);
      if (on) {
        awake.value = 1;
        return;
      }
      linger.current = setTimeout(() => {
        awake.value = 0;
      }, MINIMAP_LINGER_MS);
    },
    [awake],
  );
  useEffect(
    () => () => {
      if (linger.current) clearTimeout(linger.current);
    },
    [],
  );

  const onPage = useCallback(
    (next: number) => {
      setIndex(next);
      setPagesOpen(false);
      onIndexChange?.(next);
    },
    [onIndexChange],
  );

  const toggleChrome = useCallback(() => setChrome(on => !on), []);

  const usable = active?.url !== null;
  const gestures = useViewerGestures({
    stage,
    count: files.length,
    initialIndex: index,
    direction: isRTL ? -1 : 1,
    enabled: kind !== 'pdf' || !usable,
    zoomable: usable && (kind === 'image' || kind === 'video'),
    content,
    reduceMotion,
    onPage,
    onDismiss: onClose,
    onToggleChrome: toggleChrome,
    onActive,
  });

  useAnimatedReaction(
    () => Math.round(gestures.scale.value * 10) / 10,
    (value, previous) => {
      if (value !== previous) runOnJS(setZoom)(value);
    },
  );

  const chromeShown = useSharedValue(1);
  useEffect(() => {
    chromeShown.value = reduceMotion ? Number(chrome) : withTiming(Number(chrome), { duration: motion.duration.fast });
  }, [chrome, chromeShown, reduceMotion]);

  // A new file: fresh PDF state, the panel closed.
  useEffect(() => {
    setPdf(PDF_EMPTY);
    setPagesOpen(false);
  }, [file?.id]);

  const jump = useCallback(
    (next: number) => {
      if (next === index) return;
      gestures.jumpTo(next);
      onPage(next);
    },
    [gestures, index, onPage],
  );

  const zoomIn = useCallback(() => {
    onActive(true);
    gestures.zoomBy(ZOOM_STEP);
    onActive(false);
  }, [gestures, onActive]);

  const zoomOut = useCallback(() => {
    onActive(true);
    gestures.zoomBy(-ZOOM_STEP);
    onActive(false);
  }, [gestures, onActive]);

  const onPdfState = useCallback((next: Partial<PdfState>) => setPdf(current => ({ ...current, ...next })), []);
  const goToPage = useCallback((page: number) => {
    pdfRef.current?.setPage(page);
    setPagesOpen(false);
  }, []);
  const togglePages = useCallback(() => setPagesOpen(open => !open), []);
  const closePages = useCallback(() => setPagesOpen(false), []);
  const hideChrome = useCallback(() => setChrome(false), []);

  /** Android back / the close gesture: an open panel first, then the viewer. */
  const onRequestClose = useCallback(() => {
    if (pagesOpen) setPagesOpen(false);
    else onClose();
  }, [onClose, pagesOpen]);

  const onTopLayout = useCallback(
    (h: number) => setChromeHeights(current => (current.top === h ? current : { ...current, top: h })),
    [],
  );
  const onBottomLayout = useCallback(
    (h: number) => setChromeHeights(current => (current.bottom === h ? current : { ...current, bottom: h })),
    [],
  );

  const third = useMemo<ViewerDockAction | null>(() => {
    switch (kind) {
      case 'image':
        return { icon: Maximize2, label: t('files.viewer.fullscreen'), onPress: hideChrome };
      case 'pdf':
        return { icon: LayoutGrid, label: t('files.viewer.pages'), onPress: togglePages, active: pagesOpen };
      case 'video':
        return {
          icon: Gauge,
          label: t('files.viewer.speed'),
          text: t('files.viewer.speedValue', { rate: formatNumber(video.state.rate) }),
          onPress: video.cycleRate,
        };
      case 'document':
        return null;
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }, [hideChrome, kind, pagesOpen, t, togglePages, video.cycleRate, video.state.rate]);

  const position = t('files.viewer.positionShort', { current: index + 1, total: files.length });
  const subtitle = (() => {
    if (files.length > 1) return file?.caption ? t('files.viewer.subtitle', { caption: file.caption, position }) : position;
    if (file?.caption) return file.caption;
    return file && file.size !== null ? formatFileSize(file.size) : '';
  })();

  return {
    stage,
    file,
    active,
    kind,
    index,
    chrome,
    chromeShown,
    chromeHeights,
    onTopLayout,
    onBottomLayout,
    uriOf,
    onBroken,
    onNatural,
    naturals,
    video,
    save,
    gestures,
    content,
    awake,
    zoom,
    zoomIn,
    zoomOut,
    pdf,
    pdfRef,
    onPdfState,
    goToPage,
    pagesOpen,
    closePages,
    toggleChrome,
    jump,
    third,
    subtitle,
    onRequestClose,
  };
};
