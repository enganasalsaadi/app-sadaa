import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseInfiniteScrollOptions<T, P extends object> {
  /** Search/filter params — changing these resets to page 1 */
  params: P;
  pageSize?: number;
  /**
   * Called whenever a page needs to be fetched.
   * Typically wraps a RTK Query `trigger` function.
   */
  fetchPage: (args: P & { page: number; per_page: number }) => void;
  /** The raw array from the latest RTK Query result */
  latestData: T[] | undefined;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
}

export interface UseInfiniteScrollReturn<T> {
  items: T[];
  loadMore: () => void;
  refresh: () => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasNextPage: boolean;
  currentPage: number;
}

export const useInfiniteScroll = <T, P extends object>({
  params,
  pageSize = 10,
  fetchPage,
  latestData,
  isFetching,
  isLoading,
  isError,
}: UseInfiniteScrollOptions<T, P>): UseInfiniteScrollReturn<T> => {
  const [items, setItems] = useState<T[]>([]);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  // Latest params/fetcher kept in refs so callers may pass inline objects and
  // functions without retriggering fetches; resets key off the serialized params.
  const paramsRef = useRef(params);
  const fetchPageRef = useRef(fetchPage);
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    paramsRef.current = params;
    fetchPageRef.current = fetchPage;
  });

  useEffect(() => {
    pageRef.current = 1;
    setItems([]);
    fetchPageRef.current({ ...paramsRef.current, page: 1, per_page: pageSize });
  }, [paramsKey, pageSize]);

  useEffect(() => {
    if (!latestData || isFetching) return;
    if (pageRef.current === 1) {
      setItems(latestData);
    } else {
      setItems(prev => [...prev, ...latestData]);
    }
    hasMoreRef.current = latestData.length >= pageSize;
  }, [latestData, isFetching, pageSize]);

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || isFetching) return;
    pageRef.current += 1;
    fetchPageRef.current({
      ...paramsRef.current,
      page: pageRef.current,
      per_page: pageSize,
    });
  }, [isFetching, pageSize]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    setItems([]);
    fetchPageRef.current({ ...paramsRef.current, page: 1, per_page: pageSize });
  }, [pageSize]);

  return {
    items,
    loadMore,
    refresh,
    isLoading,
    isFetching,
    isError,
    hasNextPage: hasMoreRef.current,
    currentPage: pageRef.current,
  };
};
