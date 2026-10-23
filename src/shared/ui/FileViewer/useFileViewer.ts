import { useCallback, useMemo, useState } from 'react';
import type { FileViewerProps, ViewerFile } from './types';

type ViewerControls = Pick<FileViewerProps, 'files' | 'visible' | 'initialIndex' | 'onClose'>;

export interface UseFileViewer {
  /** Spread on `<FileViewer … />` (add `refreshUrl` / `saveable` as needed). */
  props: ViewerControls;
  /** Opens on a file by id; an id not in `files` does nothing. */
  open(id: string): void;
  openAt(index: number): void;
  close(): void;
}

/** Open / close state for a `FileViewer` over a list of files. */
export const useFileViewer = (files: readonly ViewerFile[]): UseFileViewer => {
  const [index, setIndex] = useState<number | null>(null);

  const openAt = useCallback(
    (at: number) => {
      if (at >= 0 && at < files.length) setIndex(at);
    },
    [files.length],
  );
  const open = useCallback((id: string) => openAt(files.findIndex(file => file.id === id)), [files, openAt]);
  const close = useCallback(() => setIndex(null), []);

  const props = useMemo<ViewerControls>(
    () => ({ files, visible: index !== null, initialIndex: index ?? 0, onClose: close }),
    [close, files, index],
  );

  return { props, open, openAt, close };
};
