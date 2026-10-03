import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getVersion } from 'react-native-device-info';
import i18n from '@/core/i18n';
import { appStorage, authStorage, initSecureStorage, StorageKeys } from '@/core/storage';
import { toastService } from '@/core/toast';
import { useAppDispatch, useAppSelector } from '@/core/store';
import type { BootstrapState } from './types';
import { AppStatus } from './types';
import { resolveAppStatus } from './utils/resolveAppStatus';
import { bootstrapLanguage } from './utils/bootstrapLanguage';
import { loadBootConfig } from './utils/loadBootConfig';
import { resolveBootGate } from './utils/resolveBootGate';
import { resolveDerivedStatus } from './utils/resolveDerivedStatus';
import {
  restoreToken,
  selectIsAuthenticated,
  selectIsOnboardingComplete,
  selectIsSuspended,
} from '@/domains/auth';

// Once per release: remember which latest_version was announced.
const announceSoftUpdate = (version: string) => {
  if (appStorage.get(StorageKeys.UPDATE_PROMPTED_VERSION) === version) {
    return;
  }
  appStorage.set(StorageKeys.UPDATE_PROMPTED_VERSION, version);
  toastService.info(i18n.t('appUpdate.available'));
};

/**
 * Boot pipeline (native splash stays up until isReady):
 * language → Keychain key + encrypted stores → GET /config (fail-open)
 * → maintenance / version gate → onboarding → auth status.
 */
export const useAppBootstrap = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOnboardingComplete = useAppSelector(selectIsOnboardingComplete);
  const isSuspended = useAppSelector(selectIsSuspended);
  const prevIsAuthenticatedRef = useRef(isAuthenticated);
  const [state, setState] = useState<BootstrapState>({
    status: AppStatus.LOADING,
    isReady: false,
    config: null,
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      bootstrapLanguage();
      // Before any request: prepareHeaders reads the token synchronously.
      await initSecureStorage();
      dispatch(restoreToken(authStorage.getToken() ?? null));
      const { config, isFresh } = await loadBootConfig(dispatch);
      const gate = resolveBootGate(config, isFresh, getVersion());
      if (!isMounted) return;

      setState({ status: gate.blocked ?? resolveAppStatus(), isReady: true, config });
      if (gate.softUpdateVersion) {
        announceSoftUpdate(gate.softUpdateVersion);
      }
    };

    bootstrap().catch(() => {
      if (!isMounted) return;
      setState({ status: resolveAppStatus(), isReady: true, config: null });
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // When an authenticated user logs out, transition to UNAUTHENTICATED.
  // Guard: only act on an explicit true→false transition, so the Redux initial
  // state (false) can't race the async boot.
  useEffect(() => {
    const prevIsAuthenticated = prevIsAuthenticatedRef.current;
    prevIsAuthenticatedRef.current = isAuthenticated;

    if (
      state.isReady &&
      prevIsAuthenticated &&
      !isAuthenticated &&
      state.status === AppStatus.AUTHENTICATED
    ) {
      setState(prev => ({ ...prev, status: AppStatus.UNAUTHENTICATED }));
    }
  }, [isAuthenticated, state.isReady, state.status]);

  const completeOnboarding = useCallback(() => {
    appStorage.set(StorageKeys.HAS_SEEN_ONBOARDING, 'true');
    setState(prev =>
      prev.status === AppStatus.ONBOARDING
        ? { ...prev, status: AppStatus.UNAUTHENTICATED }
        : prev,
    );
  }, []);

  const status = useMemo(
    () =>
      resolveDerivedStatus({
        isReady: state.isReady,
        bootStatus: state.status,
        isAuthenticated,
        isOnboardingComplete,
        isSuspended,
      }),
    [isAuthenticated, isOnboardingComplete, isSuspended, state.isReady, state.status],
  );

  return {
    isReady: state.isReady,
    status,
    config: state.config,
    completeOnboarding,
  };
};
