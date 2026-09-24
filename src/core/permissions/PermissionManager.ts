import {
  check,
  checkNotifications,
  openSettings,
  request,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import { Alert } from 'react-native';
import type {
  NotificationPermissionOptions,
  PermissionType,
  PermissionState,
  UnifiedPermissionStatus,
} from './permissionTypes';
import {
  DEFAULT_PERMISSION_STATUS,
  getSystemPermission,
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
    if (cached) {
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
    customMessage?: { title: string; message: string },
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
            await this.requestPermissionWithExplanation(
              type,
              undefined,
              config,
            ),
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
    return new Promise(resolve => {
      Alert.alert(
        'Permission blocked',
        `Enable ${type} permission from app settings.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Open settings',
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
