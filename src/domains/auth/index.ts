/**
 * Auth domain — public API.
 * Anything not exported here is private to the domain.
 */
export { AuthNavigator } from './navigation/AuthNavigator';
export { useFcmNotificationToken } from './hooks/useFcmNotificationToken';
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
} from './store';
export type {
  User,
  AuthState,
  UpdateProfileRequest,
  RegisterFcmTokenPayload,
} from './store';
export { BrandOnboardingNavigator } from './navigation/BrandOnboardingNavigator';
