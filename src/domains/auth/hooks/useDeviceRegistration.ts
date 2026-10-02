import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationManager, syncDeviceRegistration } from '@/core/notification';
import type { RegisterDevicePayload } from '@/core/notification';
import { useRegisterDeviceMutation } from '../api';

/**
 * Keeps this device registered for pushes while signed in (contract §11.1):
 * on sign-in (login or registration step-1), on FCM token refresh and on
 * language change. Independent of the notification permission.
 */
export const useDeviceRegistration = (isAuthenticated: boolean) => {
  const [registerDevice] = useRegisterDeviceMutation();
  const { i18n } = useTranslation();
  // The push language is `Accept-Language`: a new one re-registers.
  const { language } = i18n;

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const register = (payload: RegisterDevicePayload) => registerDevice(payload).unwrap();
    const sync = (token: string) => {
      syncDeviceRegistration(token, register);
    };
    const saved = notificationManager.getSavedToken();
    if (saved) sync(saved);
    // Fires once a first launch fetches its token, and on every refresh.
    return notificationManager.registerTokenListener(sync);
  }, [isAuthenticated, language, registerDevice]);
};
