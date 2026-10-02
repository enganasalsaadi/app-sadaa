import type { Event, EventType } from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export enum NotificationType {
  DEFAULT = 'default',
}

export type NotificationData = Record<string, string>;

export type NotificationPressSource = 'foreground' | 'background' | 'initial';

export interface NotificationPressPayload {
  type: string;
  data: NotificationData;
  source: NotificationPressSource;
}

export type NotificationRouteHandler = (
  payload: NotificationPressPayload,
) => void | Promise<void>;

export type NotificationRouteMap = Record<string, NotificationRouteHandler>;

export interface NotificationTokenListener {
  (token: string): void;
}

export type NotifeeForegroundEvent = Event & { type: EventType };

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

/** `POST /user/devices` (contract §11.1); language travels as `Accept-Language`. */
export interface RegisterDevicePayload {
  token: string;
  platform: 'android' | 'ios';
  device_id: string;
  app_version: string;
}
