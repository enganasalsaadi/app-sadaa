import { Platform } from 'react-native';
import { getUniqueId, getVersion } from 'react-native-device-info';
import { getValidLanguage } from '@/core/i18n';
import { appStorage, authStorage, StorageKeys } from '@/core/storage';
import type { DeviceSyncState } from './deviceSync';
import { needsDeviceSync, parseDeviceSyncState } from './deviceSync';
import type { RegisterDevicePayload } from './notificationTypes';

async function getPersistentDeviceId(): Promise<string> {
  const saved = appStorage.get(StorageKeys.DEVICE_ID_STORAGE_KEY);
  if (saved) return saved;
  const deviceId = await getUniqueId();
  appStorage.set(StorageKeys.DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
}

// One request per state: launch and `onTokenRefresh` can both fire at once.
let inFlightKey: string | null = null;

/**
 * `POST /user/devices` when the token, push language or app version changed
 * since the last success. Silent: a failure retries on the next trigger.
 */
export async function syncDeviceRegistration(
  token: string,
  register: (payload: RegisterDevicePayload) => Promise<unknown>,
): Promise<void> {
  const session = authStorage.getToken();
  if (!session) return;
  const current: DeviceSyncState = {
    token,
    language: getValidLanguage(appStorage.get(StorageKeys.LANGUAGE)),
    appVersion: getVersion(),
  };
  const key = JSON.stringify(current);
  const last = parseDeviceSyncState(appStorage.get(StorageKeys.PUSH_DEVICE_SYNC));
  if (key === inFlightKey || !needsDeviceSync(current, last)) return;

  inFlightKey = key;
  try {
    await register({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      device_id: await getPersistentDeviceId(),
      app_version: current.appVersion,
    });
    // Logged out mid-request: that session's marker must not skip the next one.
    if (authStorage.getToken() === session) {
      appStorage.set(StorageKeys.PUSH_DEVICE_SYNC, key);
    }
  } catch {
    // Retried on the next launch, token refresh or language change.
  } finally {
    inFlightKey = null;
  }
}
