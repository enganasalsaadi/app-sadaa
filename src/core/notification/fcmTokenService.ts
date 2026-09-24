import { Platform } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { appStorage, StorageKeys } from '@/core/storage';
import type { RegisterFcmTokenPayload } from './notificationTypes';

/**
 * Get or generate a persistent device ID
 */
async function getPersistentDeviceId(): Promise<string> {
  let deviceId = appStorage.get(StorageKeys.DEVICE_ID_STORAGE_KEY);

  // ✅ تأكد أن deviceId هو string وليس object
  if (deviceId && typeof deviceId === 'string') {
    return deviceId;
  }

  // ✅ getUniqueId() يعود برقم كـ string، لا داعي لـ any
  const newDeviceId = await getUniqueId();

  // ✅ تأكد من التخزين بصيغة string فقط
  appStorage.set(StorageKeys.DEVICE_ID_STORAGE_KEY, newDeviceId);

  return newDeviceId;
}

/**
 * Build FCM token registration payload
 */
export async function buildFcmTokenPayload(
  deviceToken: string,
): Promise<RegisterFcmTokenPayload> {
  const deviceId = await getPersistentDeviceId();

  return {
    device_token: deviceToken,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    device_id: deviceId,
  };
}

/**
 * Register FCM token with backend
 * Silent failure - logs only, no user notification
 */
export async function registerFcmToken(
  deviceToken: string,
  apiCall: (payload: RegisterFcmTokenPayload) => Promise<unknown>,
): Promise<void> {
  try {
    const payload = await buildFcmTokenPayload(deviceToken);
    await apiCall(payload);
    console.log('[FCM] Token registered successfully');
  } catch (error) {
    console.error('[FCM] Failed to register token:', error);
    // Silent failure - no user notification
  }
}
