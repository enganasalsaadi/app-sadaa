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
  NotificationTokenListener,
  PushListener,
  PushOpenHandler,
  RemoteMessage,
} from './notificationTypes';
import { parsePushPayload, type ParsedPush } from './pushPayload';
import type { PushPermission } from './pushPrompt';
import { toPushPermission } from './pushPrompt';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';
/** A tap kept for a handler that isn't there yet (cold start, boot still running). */
const PENDING_OPEN_TTL_MS = 30_000;
const messagingInstance = getMessaging(getApp());

class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;
  private initializePromise?: Promise<void>;
  private tokenListener?: NotificationTokenListener;
  private pushListeners = new Set<PushListener>();
  private openHandler?: PushOpenHandler;
  private pendingOpen?: { push: ParsedPush; at: number };
  private unsubscribeListeners: Array<() => void> = [];

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }

    return NotificationManager.instance;
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

  /**
   * Called with every push received (any app state the JS runtime is alive
   * in) or tapped; returns the unsubscribe.
   */
  registerPushListener(listener: PushListener): () => void {
    this.pushListeners.add(listener);
    return () => {
      this.pushListeners.delete(listener);
    };
  }

  /**
   * One handler routes taps. A tap that arrived before it was registered
   * (the launch tap lands while boot is still running) is delivered on
   * registration if it is recent; returns the unsubscribe.
   */
  registerOpenHandler(handler: PushOpenHandler): () => void {
    this.openHandler = handler;
    const pending = this.pendingOpen;
    this.pendingOpen = undefined;
    if (pending && Date.now() - pending.at < PENDING_OPEN_TTL_MS) {
      handler(pending.push);
    }
    return () => {
      if (this.openHandler === handler) {
        this.openHandler = undefined;
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
    this.emitPush(message.data, false);
    await this.displayFromRemoteMessage(message);
  }

  /** A tap on a notifee notification while the app was in the background. */
  onBackgroundPress(data: Readonly<Record<string, unknown>> | undefined): void {
    this.emitPush(data, true);
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
        this.emitPush(message.data, false);
        await this.displayFromRemoteMessage(message);
      },
    );

    const unsubscribeOpenedApp = onNotificationOpenedApp(
      messagingInstance,
      message => {
        this.emitPush(message.data, true);
      },
    );

    const unsubscribeForegroundEvent = notifee.onForegroundEvent(event => {
      if (event.type === EventType.PRESS) {
        this.emitPush(event.detail.notification?.data, true);
      }
    });

    getInitialNotification(messagingInstance)
      .then(message => {
        if (message) {
          this.emitPush(message.data, true);
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

  // Payloads are parsed here, so nothing downstream ever sees raw FCM data.
  private emitPush(data: Readonly<Record<string, unknown>> | undefined, opened: boolean): void {
    const push = parsePushPayload(data);
    this.pushListeners.forEach(listener => listener(push));
    if (!opened) return;
    if (this.openHandler) {
      this.openHandler(push);
    } else {
      this.pendingOpen = { push, at: Date.now() };
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
