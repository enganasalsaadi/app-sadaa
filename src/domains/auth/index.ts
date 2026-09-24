/**
 * Auth domain — public API.
 * Anything not exported here is private to the domain.
 */
export { AuthNavigator } from './navigation/AuthNavigator';
export { useAuth, useLogin, useRegister } from './hooks';
export { useFcmNotificationToken } from './hooks/useFcmNotificationToken';
export {
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} from './api';
export {
  authReducer,
  setUser,
  clearCredentials,
  selectUser,
  selectToken,
  selectIsAuthenticated,
} from './store';
export type {
  User,
  AuthState,
  UpdateProfileRequest,
  RegisterFcmTokenPayload,
} from './store';
export type { LoginFormValues, RegisterFormValues } from './hooks';
