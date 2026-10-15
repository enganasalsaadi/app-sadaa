import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager } from '@/core/notification';
import { useAppDispatch } from '@/core/store';
import { dealPushTags } from '../api/dealsApi';

/**
 * Receiving or tapping a deal push refetches that deal, its lists, history, the brand home and
 * the escrow money (M11). Only screens on show refetch; the rest are marked stale.
 */
export const useDealPushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(push => {
      const tags = dealPushTags(push.target);
      if (tags.length > 0) dispatch(baseApi.util.invalidateTags([...tags]));
    });
  }, [dispatch, isAuthenticated]);
};
