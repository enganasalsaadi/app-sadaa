import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager } from '@/core/notification';
import { useAppDispatch } from '@/core/store';

/**
 * Every push reflects a change `/me` reports (KYC, platforms, unread count),
 * so receiving or tapping one refetches it (contract §11.2). Taps don't
 * navigate yet: none of the deep-link screens exist.
 */
export const usePushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(() => {
      dispatch(baseApi.util.invalidateTags(['User']));
    });
  }, [dispatch, isAuthenticated]);
};
