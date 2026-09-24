import { useState, useCallback } from 'react';
import type { ListLayout } from '../types';

export interface UseListLayoutReturn {
  layout: ListLayout;
  setLayout: (next: ListLayout) => void;
  numColumns: number;
}

export const useListLayout = (defaultLayout: ListLayout = 'list'): UseListLayoutReturn => {
  const [layout, setLayoutState] = useState<ListLayout>(defaultLayout);

  const setLayout = useCallback((next: ListLayout) => {
    setLayoutState(next);
  }, []);

  const numColumns = layout === 'grid-3' ? 3 : layout === 'grid-2' ? 2 : 1;

  return { layout, setLayout, numColumns };
};
