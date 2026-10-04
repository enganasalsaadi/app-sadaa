import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import type { ParsedPush } from './pushPayload';

export interface NotificationTokenListener {
  (token: string): void;
}

export type PushListener = (push: ParsedPush) => void;

/** Called with a push the user tapped (opened the app from). */
export type PushOpenHandler = (push: ParsedPush) => void;

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

/** `POST /user/devices` (contract §11.1); language travels as `Accept-Language`. */
export interface RegisterDevicePayload {
  token: string;
  platform: 'android' | 'ios';
  device_id: string;
  app_version: string;
}
