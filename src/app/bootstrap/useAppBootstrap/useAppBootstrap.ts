import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '@/core/store';
import type { BootstrapState } from './types';
import { AppStatus } from './types';
import { resolveAppStatus } from './utils/resolveAppStatus';
import { bootstrapLanguage } from './utils/bootstrapLanguage';
import { selectIsAuthenticated } from '@/domains/auth';

export const useAppBootstrap = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const prevIsAuthenticatedRef = useRef(isAuthenticated);
  const [state, setState] = useState<BootstrapState>({
    status: AppStatus.LOADING,
    isReady: false,
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const bootstrap = async () => {
      bootstrapLanguage();
      const status = resolveAppStatus();

      timeoutId = setTimeout(() => {
        if (isMounted) {
          setState({ status, isReady: true });
        }
      }, 1000);
    };

    bootstrap().catch(() => {
      if (!isMounted) return;
      setState({ status: resolveAppStatus(), isReady: true });
    });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // When an authenticated user logs out, transition to UNAUTHENTICATED.
  // Guard: only act on an explicit true→false transition to avoid the Redux
  // initial state (false) racing against the 1000ms boot timeout.
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

  const status = useMemo(() => {
    if (!state.isReady) {
      return AppStatus.LOADING;
    }

    if (isAuthenticated) {
      return AppStatus.AUTHENTICATED;
    }

    return state.status;
  }, [isAuthenticated, state.isReady, state.status]);

  return {
    isReady: state.isReady,
    status,
  };
};
