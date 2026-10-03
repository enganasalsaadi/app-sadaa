import { AppStatus } from '../types';

interface ResolveDerivedStatusParams {
  isReady: boolean;
  /** The boot-resolved status (gate result or resolveAppStatus()), fixed for the session. */
  bootStatus: AppStatus;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isSuspended: boolean;
}

/**
 * Final AppStatus for a render: gates win over auth, a suspended account is
 * blocked before anything else (contract §15.11), and a logged-in user whose
 * server-side registration wizard isn't finished lands on
 * REGISTRATION_INCOMPLETE instead of AUTHENTICATED.
 */
export const resolveDerivedStatus = ({
  isReady,
  bootStatus,
  isAuthenticated,
  isOnboardingComplete,
  isSuspended,
}: ResolveDerivedStatusParams): AppStatus => {
  if (!isReady) {
    return AppStatus.LOADING;
  }

  if (
    bootStatus === AppStatus.MAINTENANCE ||
    bootStatus === AppStatus.UPDATE_REQUIRED
  ) {
    return bootStatus;
  }

  if (isAuthenticated) {
    if (isSuspended) {
      return AppStatus.SUSPENDED;
    }
    return isOnboardingComplete
      ? AppStatus.AUTHENTICATED
      : AppStatus.REGISTRATION_INCOMPLETE;
  }

  return bootStatus;
};
