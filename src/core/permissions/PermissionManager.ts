import {
  check,
  checkNotifications,
  openSettings,
  request,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import { Alert } from 'react-native';
import i18n from '@/core/i18n';
import type {
  NotificationPermissionOptions,
  PermissionType,
  PermissionState,
  UnifiedPermissionStatus,
} from './permissionTypes';
import {
  DEFAULT_PERMISSION_STATUS,
  getSystemPermission,
  PERMISSION_BLOCKED_COPY,
} from './permissionTypes';
import { createPermissionState } from './permissionUtils';

class PermissionManager {
  private static instance: PermissionManager;
  private permissionCache: Map<PermissionType, UnifiedPermissionStatus> =
    new Map();

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }

    return PermissionManager.instance;
  }

  async checkPermission(type: PermissionType): Promise<PermissionState> {
    const cached = this.permissionCache.get(type);
    // Notifications are toggled in OS Settings while the app runs: always re-read.
    if (cached && type !== 'notification') {
      return createPermissionState(type, cached);
    }

    let status: UnifiedPermissionStatus = DEFAULT_PERMISSION_STATUS;

    if (type === 'notification') {
      try {
        const result = await checkNotifications();
        this.permissionCache.set(type, result.status);
        return createPermissionState(type, result.status);
      } catch {
        this.permissionCache.set(type, RESULTS.UNAVAILABLE);
        return createPermissionState(type, RESULTS.UNAVAILABLE);
      }
    }

    const systemPermission = getSystemPermission(type);
    if (systemPermission) {
      status = await check(systemPermission);
    } else {
      status = RESULTS.UNAVAILABLE;
    }

    this.permissionCache.set(type, status);
    return createPermissionState(type, status);
  }

  async requestPermission(
    type: PermissionType,
    config?: NotificationPermissionOptions,
  ): Promise<PermissionState> {
    let status: UnifiedPermissionStatus = DEFAULT_PERMISSION_STATUS;

    if (type === 'notification') {
      try {
        const result = await requestNotifications(
          config?.options ?? ['alert', 'badge', 'sound'],
        );
        this.permissionCache.set(type, result.status);
        return createPermissionState(type, result.status);
      } catch {
        this.permissionCache.set(type, RESULTS.UNAVAILABLE);
        return createPermissionState(type, RESULTS.UNAVAILABLE);
      }
    }

    const systemPermission = getSystemPermission(type);
    if (systemPermission) {
      status = await request(systemPermission);
    } else {
      status = RESULTS.UNAVAILABLE;
    }

    this.permissionCache.set(type, status);
    return createPermissionState(type, status);
  }

  async requestPermissionWithExplanation(
    type: PermissionType,
    config?: NotificationPermissionOptions,
  ): Promise<PermissionState> {
    const current = await this.checkPermission(type);
    if (current.isGranted) {
      return current;
    }

    if (current.status === RESULTS.BLOCKED) {
      await this.showSettingsAlert(type);
      return current;
    }

    return this.requestPermission(type, config);
  }

  async checkMultiplePermissions(
    types: PermissionType[],
  ): Promise<Record<PermissionType, PermissionState>> {
    const entries = await Promise.all(
      types.map(
        async type => [type, await this.checkPermission(type)] as const,
      ),
    );
    return Object.fromEntries(entries) as Record<
      PermissionType,
      PermissionState
    >;
  }

  async requestMultiplePermissions(
    types: PermissionType[],
    config?: NotificationPermissionOptions,
  ): Promise<Record<PermissionType, PermissionState>> {
    const entries = await Promise.all(
      types.map(
        async type =>
          [
            type,
            await this.requestPermissionWithExplanation(type, config),
          ] as const,
      ),
    );
    return Object.fromEntries(entries) as Record<
      PermissionType,
      PermissionState
    >;
  }

  async openAppSettings(): Promise<void> {
    await openSettings();
  }

  resetCache(): void {
    this.permissionCache.clear();
  }

  private showSettingsAlert(type: PermissionType): Promise<void> {
    const copy = PERMISSION_BLOCKED_COPY[type];
    return new Promise(resolve => {
      Alert.alert(
        i18n.t(copy.title),
        i18n.t(copy.message),
        [
          {
            text: i18n.t('common.cancel'),
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: i18n.t('permissions.openSettings'),
            onPress: () => {
              this.openAppSettings().finally(() => resolve());
            },
          },
        ],
      );
    });
  }
}

export const permissionManager = PermissionManager.getInstance();
