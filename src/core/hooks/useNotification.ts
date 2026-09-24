import { useCallback } from 'react';
import type {
  NotificationType} from '@/core/notification';
import {
  notificationManager,
  type NotificationInitOptions,
  type NotificationRouteHandler,
  type NotificationTokenListener,
} from '@/core/notification';

export const useNotification = () => {
  const initialize = useCallback((options?: NotificationInitOptions) => {
    return notificationManager.initialize(options);
  }, []);

  const requestPermission = useCallback(() => {
    return notificationManager.requestPermission();
  }, []);

  const getPermission = useCallback(() => {
    return notificationManager.getPermission();
  }, []);

  const getToken = useCallback(() => {
    return notificationManager.getToken();
  }, []);

  const refreshTokenIfPermitted = useCallback(() => {
    return notificationManager.refreshTokenIfPermitted();
  }, []);

  const getSavedToken = useCallback(() => {
    return notificationManager.getSavedToken();
  }, []);

  const setNavigate = useCallback(
    (navigate: (screen: string, params?: Record<string, unknown>) => void) => {
      notificationManager.setNavigate(navigate);
    },
    [],
  );

  const registerTypeHandler = useCallback(
    (type: NotificationType | string, handler: NotificationRouteHandler) => {
      notificationManager.registerRoute(type, handler);
    },
    [],
  );

  const registerTokenListener = useCallback(
    (listener: NotificationTokenListener) => {
      notificationManager.registerTokenListener(listener);
    },
    [],
  );

  return {
    initialize,
    requestPermission,
    getPermission,
    getToken,
    refreshTokenIfPermitted,
    getSavedToken,
    setNavigate,
    registerTypeHandler,
    registerTokenListener,
  };
};
