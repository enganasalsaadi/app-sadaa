import { useCallback, useMemo, useState } from 'react';
import type { DealFile } from '../types';

/** Ready image files open in the in-app viewer; video and documents wait for the drafts viewer (P5). */
export const isViewableImage = (
  file: DealFile,
): file is DealFile & { url: string } =>
  file.kind === 'image' && file.url !== null;

export const useDealGallery = (files: DealFile[]) => {
  const images = useMemo(() => files.filter(isViewableImage), [files]);
  const urls = useMemo(() => images.map(file => file.url), [images]);
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback(
    (id: string) => {
      const at = images.findIndex(file => file.id === id);
      if (at >= 0) setIndex(at);
    },
    [images],
  );
  const close = useCallback(() => setIndex(null), []);
  return { urls, index, open, close };
};
