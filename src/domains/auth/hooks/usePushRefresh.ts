import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager } from '@/core/notification';
import { useAppDispatch } from '@/core/store';
import { walletPushTags } from '@/domains/finance';

/**
 * Every push reflects a change `/me` reports (KYC, platforms, unread count)
 * and adds an inbox entry, so receiving or tapping one refetches both
 * (contract §11.2); a wallet push also refetches the balance and its list
 * (handoff §9). Tap routing lives in the notifications domain.
 */
export const usePushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(push => {
      dispatch(
        baseApi.util.invalidateTags(['User', 'Kyc', 'Notification', ...walletPushTags(push.type)]),
      );
    });
  }, [dispatch, isAuthenticated]);
};
