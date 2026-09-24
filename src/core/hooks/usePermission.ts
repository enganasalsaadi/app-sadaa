import { usePermission as usePermissionCore } from '@/core/permissions/permissionHooks';
import type { PermissionType } from '@/core/permissions/permissionTypes';

export const usePermission = (type: PermissionType) => {
  const { isGranted, request, status, isLoading, openSettings } =
    usePermissionCore(type);

  return {
    hasPermission: isGranted,
    askPermission: request,
    status,
    isLoading,
    needsToAsk: status === 'denied',
    needsToOpenSettings: status === 'blocked',
    openSettings,
  };
};
