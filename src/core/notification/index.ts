import notifee, { EventType } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { notificationManager } from './NotificationManager';
import { NotificationType } from './notificationTypes';

let backgroundHandlersRegistered = false;

export const registerNotificationBackgroundHandlers = () => {
  if (backgroundHandlersRegistered) {
    return;
  }

  setBackgroundMessageHandler(getMessaging(), async message => {
    await notificationManager.onBackgroundMessage(message);
  });

  notifee.onBackgroundEvent(async event => {
    if (event.type !== EventType.PRESS) {
      return;
    }

    const data = (event.detail.notification?.data ?? {}) as Record<
      string,
      string
    >;

    await notificationManager.onBackgroundEvent({
      type: data.type ?? NotificationType.DEFAULT,
      data,
      source: 'background',
    });
  });

  backgroundHandlersRegistered = true;
};

export { notificationManager };
export { NotificationType } from './notificationTypes';
export type {
  NotificationData,
  NotificationInitOptions,
  NotificationPressPayload,
  NotificationRouteHandler,
  NotificationRouteMap,
  NotificationTokenListener,
} from './notificationTypes';
export { registerFcmToken, buildFcmTokenPayload } from './fcmTokenService';
