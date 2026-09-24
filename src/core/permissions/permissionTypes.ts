import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  type NotificationOption,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions';

export type PermissionType =
  | 'location'
  | 'notification'
  | 'camera'
  | 'gallery'
  | 'microphone'
  | 'storage';

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
  if (Platform.OS === 'android') {
    switch (type) {
      case 'location':
        return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      case 'camera':
        return PERMISSIONS.ANDROID.CAMERA;
      case 'gallery':
        return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      case 'microphone':
        return PERMISSIONS.ANDROID.RECORD_AUDIO;
      case 'storage':
        return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      default:
        return null;
    }
  }

  if (Platform.OS === 'ios') {
    switch (type) {
      case 'location':
        return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      case 'camera':
        return PERMISSIONS.IOS.CAMERA;
      case 'gallery':
        return PERMISSIONS.IOS.PHOTO_LIBRARY;
      case 'microphone':
        return PERMISSIONS.IOS.MICROPHONE;
      case 'storage':
        return PERMISSIONS.IOS.MEDIA_LIBRARY;
      default:
        return null;
    }
  }

  return null;
};

export const permissionMessages: Record<
  PermissionType,
  { title: string; message: string }
> = {
  location: {
    title: 'Need your location',
    message: 'Used to show nearby hotels and restaurants.',
  },
  notification: {
    title: 'Enable notifications',
    message: 'Used for booking confirmations and reminders.',
  },
  camera: {
    title: 'Camera access',
    message: 'Used to capture photos for reviews and listings.',
  },
  gallery: {
    title: 'Gallery access',
    message: 'Used to upload photos for reviews and listings.',
  },
  microphone: {
    title: 'Microphone access',
    message: 'Used for voice search features.',
  },
  storage: {
    title: 'Storage access',
    message: 'Used to save and read booking files and photos.',
  },
};

export const DEFAULT_PERMISSION_STATUS = RESULTS.DENIED as UnifiedPermissionStatus;
