import { useCallback } from 'react';
import { notificationManager } from '@/core/notification';

export const useNotification = () => {
  const initialize = useCallback(() => {
    return notificationManager.initialize();
  }, []);

  return { initialize };
};
