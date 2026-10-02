import { Platform } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { appStorage, StorageKeys } from '@/core/storage';
import { permissionManager } from '@/core/permissions';
import type {
  NotificationData,
  NotificationPressPayload,
  NotificationRouteHandler,
  NotificationRouteMap,
  NotificationTokenListener,
  RemoteMessage,
} from './notificationTypes';
import { NotificationType } from './notificationTypes';
import type { PushPermission } from './pushPrompt';
import { toPushPermission } from './pushPrompt';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';
const messagingInstance = getMessaging(getApp());

class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;
  private initializePromise?: Promise<void>;
  private routes: NotificationRouteMap = {};
  private tokenListener?: NotificationTokenListener;
  private navigate?: (screen: string, params?: Record<string, unknown>) => void;
  private unsubscribeListeners: Array<() => void> = [];

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }

    return NotificationManager.instance;
  }

  setNavigate(
    navigate: (screen: string, params?: Record<string, unknown>) => void,
  ): void {
    this.navigate = navigate;
  }

  registerRoute(
    notificationType: string,
    handler: NotificationRouteHandler,
  ): void {
    this.routes[notificationType] = handler;
  }

  /** Called with every token fetched or refreshed; returns the unsubscribe. */
  registerTokenListener(listener: NotificationTokenListener): () => void {
    this.tokenListener = listener;
    return () => {
      if (this.tokenListener === listener) {
        this.tokenListener = undefined;
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = this.performInitialize();

    try {
      await this.initializePromise;
    } finally {
      this.initializePromise = undefined;
    }
  }

  async requestPermission() {
    return permissionManager.requestPermission('notification');
  }

  async getPermission() {
    return permissionManager.checkPermission('notification');
  }

  async getPushPermission(): Promise<PushPermission> {
    const { status } = await this.getPermission();
    return toPushPermission(status);
  }

  /** The OS dialog; only call it from the soft prompt or the Settings row. */
  async requestPushPermission(): Promise<PushPermission> {
    const { status } = await this.requestPermission();
    const permission = toPushPermission(status);
    if (permission === 'enabled' && !this.getSavedToken()) {
      // The launch fetch failed (offline): a grant is a good moment to retry.
      this.getToken().catch(() => undefined);
    }
    return permission;
  }

  getSavedToken(): string | undefined {
    return appStorage.get(StorageKeys.PUSH_TOKEN);
  }

  async getToken(): Promise<string> {
    const token = await getToken(messagingInstance);
    this.persistToken(token);
    return token;
  }

  async dispose(): Promise<void> {
    this.unsubscribeListeners.forEach(unsubscribe => unsubscribe());
    this.unsubscribeListeners = [];
    this.isInitialized = false;
    this.initializePromise = undefined;
  }

  async onBackgroundMessage(message: RemoteMessage): Promise<void> {
    await this.displayFromRemoteMessage(message);
  }

  async onBackgroundEvent(data: NotificationPressPayload): Promise<void> {
    await this.handlePress(data);
  }

  private async performInitialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: DEFAULT_ANDROID_CHANNEL_ID,
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }

    this.setupListeners();

    // FCM issues a token without the display permission, so the device is
    // registered either way and turning pushes on later needs no extra step.
    // The permission itself is only ever asked from the soft prompt.
    await this.getToken().catch(() => undefined);

    this.isInitialized = true;
  }

  private setupListeners(): void {
    if (this.unsubscribeListeners.length > 0) {
      return;
    }

    const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, token => {
      this.persistToken(token);
    });

    const unsubscribeForegroundMessage = onMessage(
      messagingInstance,
      async message => {
        await this.displayFromRemoteMessage(message as RemoteMessage);
      },
    );

    const unsubscribeOpenedApp = onNotificationOpenedApp(
      messagingInstance,
      message => {
        this.processRemotePress(message as RemoteMessage, 'background');
      },
    );

    const unsubscribeForegroundEvent = notifee.onForegroundEvent(
      async event => {
        if (event.type === EventType.PRESS) {
          const data = (event.detail.notification?.data ??
            {}) as NotificationData;
          await this.handlePress({
            type: data.type ?? NotificationType.DEFAULT,
            data,
            source: 'foreground',
          });
        }
      },
    );

    getInitialNotification(messagingInstance)
      .then(message => {
        if (message) {
          this.processRemotePress(message as RemoteMessage, 'initial');
        }
      })
      .catch(() => undefined);

    this.unsubscribeListeners = [
      unsubscribeTokenRefresh,
      unsubscribeForegroundMessage,
      unsubscribeOpenedApp,
      unsubscribeForegroundEvent,
    ];
  }

  private persistToken(token: string): void {
    if (!token) {
      return;
    }
    appStorage.set(StorageKeys.PUSH_TOKEN, token);
    this.tokenListener?.(token);
  }

  private async displayFromRemoteMessage(
    message: RemoteMessage,
  ): Promise<void> {
    if (!message.notification) {
      return;
    }

    await notifee.displayNotification({
      title: message.notification.title ?? '',
      body: message.notification.body ?? '',
      data: message.data,
      android: {
        channelId: DEFAULT_ANDROID_CHANNEL_ID,
        // White silhouette drawable generated by scripts/logo/native.py (rule 08).
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    });
  }

  private processRemotePress(
    message: RemoteMessage,
    source: NotificationPressPayload['source'],
  ): void {
    const data = (message.data ?? {}) as NotificationData;

    this.handlePress({
      type: data.type ?? NotificationType.DEFAULT,
      data,
      source,
    }).catch(() => undefined);
  }

  private async handlePress(payload: NotificationPressPayload): Promise<void> {
    const handler = this.routes[payload.type];
    if (handler) {
      await handler(payload);
      return;
    }

    const fallbackScreen = payload.data.screen;
    if (fallbackScreen && this.navigate) {
      this.navigate(fallbackScreen, payload.data);
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
