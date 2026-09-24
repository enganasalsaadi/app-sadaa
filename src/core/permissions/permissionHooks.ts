import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { permissionManager } from './PermissionManager';
import type { PermissionState, PermissionType } from './permissionTypes';
import { RESULTS } from 'react-native-permissions';

const initialState = (type: PermissionType): PermissionState => ({
  type,
  status: RESULTS.DENIED,
  isGranted: false,
  canAskAgain: true,
});

export const usePermission = (type: PermissionType) => {
  const [permission, setPermission] = useState<PermissionState>(() =>
    initialState(type),
  );
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    setIsLoading(true);
    const current = await permissionManager.checkPermission(type);
    setPermission(current);
    setIsLoading(false);
    return current;
  }, [type]);

  const request = useCallback(async () => {
    setIsLoading(true);
    const next = await permissionManager.requestPermissionWithExplanation(type);
    setPermission(next);
    setIsLoading(false);
    return next;
  }, [type]);

  const openSettings = useCallback(() => {
    permissionManager.openAppSettings().catch(() => undefined);
  }, []);

  useEffect(() => {
    check().catch(() => setIsLoading(false));
  }, [check]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        permissionManager.resetCache();
        check().catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [check]);

  return {
    status: permission.status,
    permission,
    isLoading,
    isGranted: permission.isGranted,
    isDenied: permission.status === RESULTS.DENIED,
    isBlocked: permission.status === RESULTS.BLOCKED,
    check,
    request,
    openSettings,
  };
};

export const useMultiplePermissions = (types: PermissionType[]) => {
  const [permissions, setPermissions] = useState<
    Partial<Record<PermissionType, PermissionState>>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const checkAll = useCallback(async () => {
    setIsLoading(true);
    const next = await permissionManager.checkMultiplePermissions(types);
    setPermissions(next);
    setIsLoading(false);
    return next;
  }, [types]);

  const requestAll = useCallback(async () => {
    setIsLoading(true);
    const next = await permissionManager.requestMultiplePermissions(types);
    setPermissions(next);
    setIsLoading(false);
    return next;
  }, [types]);

  useEffect(() => {
    checkAll().catch(() => setIsLoading(false));
  }, [checkAll]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        permissionManager.resetCache();
        checkAll().catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAll]);

  const allGranted = types.every(type => permissions[type]?.isGranted);
  const anyDenied = types.some(
    type =>
      permissions[type]?.status === RESULTS.DENIED ||
      permissions[type]?.status === RESULTS.BLOCKED,
  );

  return {
    permissions,
    isLoading,
    allGranted,
    anyDenied,
    checkAll,
    requestAll,
  };
};

export const useCheckPermission = (type: PermissionType) => {
  const [isGranted, setIsGranted] = useState(false);

  const check = useCallback(async () => {
    const state = await permissionManager.checkPermission(type);
    setIsGranted(state.isGranted);
    return state.isGranted;
  }, [type]);

  useEffect(() => {
    check().catch(() => setIsGranted(false));
  }, [check]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        permissionManager.resetCache();
        check().catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [check]);

  return { isGranted, check };
};
