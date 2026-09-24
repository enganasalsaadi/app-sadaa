import { RESULTS } from 'react-native-permissions';
import type { PermissionState, UnifiedPermissionStatus } from './permissionTypes';
import type { PermissionType } from './permissionTypes';

export const isPermissionGranted = (status: UnifiedPermissionStatus): boolean =>
  status === RESULTS.GRANTED || status === RESULTS.LIMITED;

export const canPermissionAskAgain = (
  status: UnifiedPermissionStatus,
): boolean => status === RESULTS.DENIED;

export const createPermissionState = (
  type: PermissionType,
  status: UnifiedPermissionStatus,
): PermissionState => ({
  type,
  status,
  isGranted: isPermissionGranted(status),
  canAskAgain: canPermissionAskAgain(status),
});

export const isPermissionBlocked = (status: UnifiedPermissionStatus): boolean =>
  status === RESULTS.BLOCKED;
