import React, { memo, useCallback, useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import Pdf, { type PdfRef } from 'react-native-pdf';
import { downloads, type RefreshUrl, type RemoteFile } from '@/core/download';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { ViewerFallback } from './ViewerFallback';
import type { PdfState } from './types';

export interface ViewerPdfProps {
  file: RemoteFile;
  refreshUrl?: RefreshUrl;
  pdfRef: React.RefObject<PdfRef | null>;
  /** Space kept clear under the top bar and above the dock. */
  insetTop: number;
  insetBottom: number;
  /** Merged into what the overlay shows. */
  onState: (state: Partial<PdfState>) => void;
  onTap: () => void;
}

const MAX_SCALE = 5;

type Phase = { kind: 'loading'; progress: number } | { kind: 'ready'; path: string } | { kind: 'failed' };

/**
 * A PDF read in-app: downloaded once to the cache (the same copy «save» uses), then pages scroll
 * vertically with native pinch zoom (PDFKit / PdfRenderer). Reports page, page count and zoom up.
 */
const ViewerPdfComponent: React.FC<ViewerPdfProps> = ({
  file,
  refreshUrl,
  pdfRef,
  insetTop,
  insetBottom,
  onState,
  onTap,
}) => {
  const { spacing } = useTheme();
  const styles = useStyles(
    ({ colors }): Record<'frame' | 'pdf', ViewStyle> => ({
      frame: { flex: 1, paddingTop: insetTop, paddingBottom: insetBottom },
      pdf: { flex: 1, backgroundColor: colors.viewer.backdrop },
    }),
    [insetTop, insetBottom],
  );
  const [phase, setPhase] = useState<Phase>({ kind: 'loading', progress: 0 });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setPhase({ kind: 'loading', progress: 0 });
    const cached = downloads.cache({ file, refreshUrl }, progress =>
      setPhase(current => (current.kind === 'loading' ? { kind: 'loading', progress } : current)),
    );
    let alive = true;
    cached.promise
      .then(path => {
        if (alive) setPhase(path ? { kind: 'ready', path } : { kind: 'failed' });
      })
      .catch(() => {
        if (alive) setPhase({ kind: 'failed' });
      });
    return () => {
      alive = false;
      cached.cancel();
    };
  }, [file, refreshUrl, attempt]);

  const retry = useCallback(() => setAttempt(value => value + 1), []);

  const onLoadComplete = useCallback(
    (count: number) => onState({ page: 1, pages: count, scale: 1 }),
    [onState],
  );

  const onPageChanged = useCallback(
    (page: number, count: number) => onState({ page, pages: count }),
    [onState],
  );

  const onScaleChanged = useCallback((scale: number) => onState({ scale }), [onState]);

  const onError = useCallback(() => setPhase({ kind: 'failed' }), []);

  if (!file.url && !refreshUrl) return <ViewerFallback state="gone" />;
  if (phase.kind === 'failed') return <ViewerFallback state="failed" onRetry={retry} />;
  if (phase.kind === 'loading') return <ViewerFallback state="loading" progress={phase.progress} />;

  return (
    <Box style={styles.frame}>
      <Pdf
        ref={pdfRef}
        source={{ uri: `file://${phase.path}` }}
        style={styles.pdf}
        maxScale={MAX_SCALE}
        spacing={spacing.md}
        fitPolicy={0}
        enableAntialiasing
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onScaleChanged={onScaleChanged}
        onPageSingleTap={onTap}
        onError={onError}
      />
    </Box>
  );
};

export const ViewerPdf = memo(ViewerPdfComponent);
