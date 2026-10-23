import type { ParseKeys } from 'i18next';
import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  type NotificationOption,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions';

// Only what the app requests: iOS via Podfile setup_permissions, Android notifications only.
/** `photosSave` = add-only Photos access (iOS) to save deal files; Android saves through MediaStore without one. */
export type PermissionType = 'notification' | 'camera' | 'gallery' | 'photosSave';

export type UnifiedPermissionStatus = PermissionStatus;

export interface PermissionState {
  type: PermissionType;
  status: UnifiedPermissionStatus;
  isGranted: boolean;
  canAskAgain: boolean;
}

export interface NotificationPermissionOptions {
  options?: NotificationOption[];
}

export const getSystemPermission = (
  type: Exclude<PermissionType, 'notification'>,
): Permission | null => {
  // Android declares neither CAMERA nor READ_MEDIA_*: the system photo picker and
  // the camera-app intent need no runtime permission, so nothing to request.
  if (Platform.OS === 'android') {
    return null;
  }

  if (Platform.OS === 'ios') {
    switch (type) {
      case 'camera':
        return PERMISSIONS.IOS.CAMERA;
      case 'gallery':
        return PERMISSIONS.IOS.PHOTO_LIBRARY;
      case 'photosSave':
        return PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
      default:
        return null;
    }
  }

  return null;
};

// Shown when the OS will no longer prompt (blocked) and the user must go to Settings.
export const PERMISSION_BLOCKED_COPY = {
  notification: {
    title: 'permissions.notification.title',
    message: 'permissions.notification.message',
  },
  camera: {
    title: 'permissions.camera.title',
    message: 'permissions.camera.message',
  },
  gallery: {
    title: 'permissions.gallery.title',
    message: 'permissions.gallery.message',
  },
  photosSave: {
    title: 'permissions.photosSave.title',
    message: 'permissions.photosSave.message',
  },
} as const satisfies Record<
  PermissionType,
  { title: ParseKeys; message: ParseKeys }
>;

export const DEFAULT_PERMISSION_STATUS = RESULTS.DENIED as UnifiedPermissionStatus;
