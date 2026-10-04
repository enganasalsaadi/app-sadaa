import notifee, { EventType } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { notificationManager } from './NotificationManager';

let backgroundHandlersRegistered = false;

export const registerNotificationBackgroundHandlers = () => {
  if (backgroundHandlersRegistered) {
    return;
  }

  setBackgroundMessageHandler(getMessaging(), async message => {
    await notificationManager.onBackgroundMessage(message);
  });

  notifee.onBackgroundEvent(async event => {
    if (event.type === EventType.PRESS) {
      notificationManager.onBackgroundPress(event.detail.notification?.data);
    }
  });

  backgroundHandlersRegistered = true;
};

export { notificationManager };
export type { RegisterDevicePayload } from './notificationTypes';
export { parsePushPayload } from './pushPayload';
export type { ParsedPush, PushTarget, PushType } from './pushPayload';
export { syncDeviceRegistration } from './fcmTokenService';
export type { PushPermission } from './pushPrompt';
export {
  shouldAutoPrompt,
  recordPushPromptShown,
  recordPushPromptDismissed,
} from './pushPrompt';
