import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/core/toast';

/** Fake request time so the loading slot is visible. */
const DEMO_SEARCH_MS = 800;

export const useSearchBarDemo = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), DEMO_SEARCH_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const submit = useCallback((text: string) => toast.info(text), [toast]);

  return { query, setQuery, loading, submit };
};
