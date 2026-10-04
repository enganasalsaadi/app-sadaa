import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { notificationManager, type PushPermission } from '@/core/notification';
import { permissionManager } from '@/core/permissions';

/**
 * Live OS push status for the Profile card: re-read on foreground (the user may
 * flip it in Settings). `null` while the first read is in flight.
 */
export const usePushPermissionStatus = () => {
  const [permission, setPermission] = useState<PushPermission | null>(null);

  const refresh = useCallback(() => {
    notificationManager
      .getPushPermission()
      .then(setPermission)
      .catch(() => setPermission('unavailable'));
  }, []);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (permission === 'blocked') {
      await permissionManager.openAppSettings();
      return;
    }
    setPermission(await notificationManager.requestPushPermission());
  }, [permission]);

  return { permission, enable };
};
