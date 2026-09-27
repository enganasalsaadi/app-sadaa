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
      }),
    ).toBe(AppStatus.REGISTRATION_INCOMPLETE);
  });

  it('falls back to the boot-resolved status when unauthenticated', () => {
    expect(
      resolveDerivedStatus({
        isReady: true,
        bootStatus: AppStatus.ONBOARDING,
        isAuthenticated: false,
        isOnboardingComplete: false,
      }),
    ).toBe(AppStatus.ONBOARDING);
  });
});
