import { useCallback } from 'react';
import { useRegisterFcmTokenMutation } from '../api';
import {
  registerFcmToken,
  notificationManager,
} from '@/core/notification';

export const useFcmNotificationToken = () => {
  const [registerFcmTokenMutation] = useRegisterFcmTokenMutation();

  const registerToken = useCallback(async () => {
    const savedToken = notificationManager.getSavedToken();
    if (savedToken) {
      await registerFcmToken(savedToken, async payload => {
        return registerFcmTokenMutation(payload).unwrap();
      });
    }
  }, [registerFcmTokenMutation]);

  return {
    registerToken,
  };
};
