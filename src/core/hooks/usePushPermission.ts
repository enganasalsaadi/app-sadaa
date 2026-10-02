import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { notificationManager } from '@/core/notification';
import type { PushPermission } from '@/core/notification';
import { permissionManager } from '@/core/permissions';

/**
 * Live notification permission: re-read on every return to the foreground,
 * so a change made in OS Settings shows up at once. `null` until first read.
 */
export const usePushPermission = () => {
  const [permission, setPermission] = useState<PushPermission | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const refresh = useCallback(() => {
    notificationManager
      .getPushPermission()
      .then(setPermission)
      .catch(() => setPermission('unavailable'));
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    setIsRequesting(true);
    try {
      setPermission(await notificationManager.requestPushPermission());
    } catch {
      refresh();
    } finally {
      setIsRequesting(false);
    }
  }, [refresh]);

  const openSettings = useCallback(() => {
    permissionManager.openAppSettings().catch(() => undefined);
  }, []);

  return { permission, isRequesting, request, openSettings };
};
