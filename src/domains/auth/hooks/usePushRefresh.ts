import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager, VERIFICATION_PUSH_TYPES, type PushType } from '@/core/notification';
import { useAppDispatch } from '@/core/store';
import { walletPushTags } from '@/domains/finance';

const isVerificationPush = (type: PushType | null): boolean =>
  (VERIFICATION_PUSH_TYPES as readonly (PushType | null)[]).includes(type);

/**
 * Every push reflects a change `/me` reports (KYC, platforms, unread count)
 * and adds an inbox entry, so receiving or tapping one refetches both
 * (contract §11.2); a wallet push also refetches the balance and its list
 * (handoff §9); a company verification push also refetches the social / domain route state.
 * Tap routing lives in the notifications domain.
 */
export const usePushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(push => {
      dispatch(
        baseApi.util.invalidateTags([
          'User',
          'Kyc',
          'Notification',
          ...(isVerificationPush(push.type) ? (['Verification'] as const) : []),
          ...walletPushTags(push.type),
        ]),
      );
    });
  }, [dispatch, isAuthenticated]);
};
