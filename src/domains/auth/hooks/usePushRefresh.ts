import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager } from '@/core/notification';
import { useAppDispatch } from '@/core/store';

/**
 * Every push reflects a change `/me` reports (KYC, platforms, unread count)
 * and adds an inbox entry, so receiving or tapping one refetches both
 * (contract §11.2). Tap routing lives in the notifications domain.
 */
export const usePushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(() => {
      dispatch(baseApi.util.invalidateTags(['User', 'Kyc', 'Notification']));
    });
  }, [dispatch, isAuthenticated]);
};
