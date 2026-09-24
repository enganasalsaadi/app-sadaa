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

export interface NotificationInitOptions {
  requestPermissionOnInit?: boolean;
}

export interface NotificationTokenListener {
  (token: string): void;
}

export type NotifeeForegroundEvent = Event & { type: EventType };

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

export interface RegisterFcmTokenPayload {
  device_token: string;
  platform: 'android' | 'ios';
  device_id: string;
}
