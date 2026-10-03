/**
 * Auth domain — public API.
 * Anything not exported here is private to the domain.
 */
export { AuthNavigator } from './navigation/AuthNavigator';
export { useDeviceRegistration } from './hooks/useDeviceRegistration';
export { usePushRefresh } from './hooks/usePushRefresh';
export {
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useGetOnboardingProgressQuery,
} from './api';
export {
  authReducer,
  setUser,
  clearCredentials,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectUserType,
  selectCurrentStep,
  selectIsOnboardingComplete,
  selectIsSuspended,
} from './store';
export type {
  User,
  AuthState,
  UpdateProfileRequest,
} from './store';
export { BrandOnboardingNavigator } from './navigation/BrandOnboardingNavigator';
export { InfluencerOnboardingNavigator } from './navigation/InfluencerOnboardingNavigator';
export { SuspendedScreen } from './screens';
