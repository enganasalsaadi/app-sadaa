import type { RootState } from '@/app/store';

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectUserType = (state: RootState) => state.auth.userType ?? null;
export const selectCurrentStep = (state: RootState) => state.auth.currentStep ?? null;
// Default true: sessions without these flags (e.g. legacy email login) are
// never redirected into the registration-resume gate.
export const selectIsOnboardingComplete = (state: RootState) =>
  state.auth.isOnboardingComplete ?? true;
