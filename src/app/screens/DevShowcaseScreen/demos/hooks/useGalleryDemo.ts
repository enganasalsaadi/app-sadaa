import { useCallback, useState } from 'react';

export const useGalleryDemo = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = useCallback((index: number) => setOpenIndex(index), []);
  const close = useCallback(() => setOpenIndex(null), []);
  return { openIndex, open, close };
};
