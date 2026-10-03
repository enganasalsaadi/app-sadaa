import { AppStatus } from '../../types';
import { resolveDerivedStatus } from '../resolveDerivedStatus';

describe('resolveDerivedStatus', () => {
  it('stays LOADING until ready', () => {
    expect(
      resolveDerivedStatus({
        isReady: false,
        bootStatus: AppStatus.UNAUTHENTICATED,
        isAuthenticated: false,
        isOnboardingComplete: true,
        isSuspended: false,
      }),
    ).toBe(AppStatus.LOADING);
  });

  it('lets a boot gate win over an authenticated session', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.UPDATE_REQUIRED,
        isAuthenticated: true,
        isOnboardingComplete: true,
        isSuspended: false,
      }),
    ).toBe(AppStatus.UPDATE_REQUIRED);
  });

  it('is AUTHENTICATED once onboarding is complete', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.AUTHENTICATED,
        isAuthenticated: true,
        isOnboardingComplete: true,
        isSuspended: false,
      }),
    ).toBe(AppStatus.AUTHENTICATED);
  });

  it('routes to REGISTRATION_INCOMPLETE when the resume flag is false', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.AUTHENTICATED,
        isAuthenticated: true,
        isOnboardingComplete: false,
        isSuspended: false,
      }),
    ).toBe(AppStatus.REGISTRATION_INCOMPLETE);
  });

  it('blocks a suspended session before the registration wizard', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.AUTHENTICATED,
        isAuthenticated: true,
        isOnboardingComplete: false,
        isSuspended: true,
      }),
    ).toBe(AppStatus.SUSPENDED);
  });

  it('lets maintenance win over a suspended session', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.MAINTENANCE,
        isAuthenticated: true,
        isOnboardingComplete: true,
        isSuspended: true,
      }),
    ).toBe(AppStatus.MAINTENANCE);
  });

  it('ignores a stale suspended flag without a session', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.UNAUTHENTICATED,
        isAuthenticated: false,
        isOnboardingComplete: true,
        isSuspended: true,
      }),
    ).toBe(AppStatus.UNAUTHENTICATED);
  });

  it('falls back to the boot-resolved status when unauthenticated', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.ONBOARDING,
        isAuthenticated: false,
        isOnboardingComplete: false,
        isSuspended: false,
      }),
    ).toBe(AppStatus.ONBOARDING);
  });
});
