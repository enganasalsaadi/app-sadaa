import { authStorage } from '@/core/storage';
import { replace } from '@/core/navigation';
import { setCredentials, setUser, setToken, clearCredentials } from '../store';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  User,
  RegisterFcmTokenPayload,
  RequestPasswordResetRequest,
  VerifyPasswordResetOtpRequest,
  ResendPasswordResetOtpRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  LogoutRequest,
} from '../store';
import { baseApi } from '@/core/api';

const navigateAfterAuth = () => {
  // Replace to Main after a short delay to allow the AUTHENTICATED status
  // re-render to propagate before the navigation stack is confirmed.
  setTimeout(() => replace('Main'), 300);
};

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Phone+password login. No `user` object is returned — `user` is
    // hydrated separately by GET /auth/me once the token is set (useAuth).
    // Routing (Main vs the registration-resume gate) follows automatically
    // from AppStatus once `isOnboardingComplete` is in the store — no
    // imperative navigation here.
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          authStorage.saveToken(data.token);
          dispatch(
            setToken({
              token: data.token,
              userType: data.user_type,
              currentStep: data.current_step,
              isOnboardingComplete: data.is_onboarding_complete,
            }),
          );
        } catch {}
      },
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: body => ({ url: '/auth/register', method: 'POST', body }),
    }),
    // Verify the 5-digit email OTP. On success a bearer token is returned and
    // the app is logged in immediately (same flow as login).
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: body => ({ url: '/auth/verify-otp', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          authStorage.saveToken(data.token);
          if (data.refresh_token) {
            authStorage.saveRefreshToken(data.refresh_token);
          }
          dispatch(setCredentials({ user: data.user, token: data.token }));
          navigateAfterAuth();
        } catch {}
      },
    }),
    // Resend the email OTP. Throttled server-side (429 on too-frequent sends).
    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: body => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    registerFcmToken: builder.mutation<
      { success: boolean },
      RegisterFcmTokenPayload
    >({
      query: body => ({
        url: '/auth/fcm/register',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: body => ({ url: '/auth/logout', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Logout is best-effort: an expired server session (401) still
          // clears local state below.
        } finally {
          await authStorage.clearTokens();
          await authStorage.clearCart();
          dispatch(clearCredentials());
        }
      },
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {}
      },
    }),
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: body => ({ url: '/account/profile', method: 'POST', body }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {}
      },
    }),
    // Forgot Password (phone OTP wizard), step 1: sends a 4-digit code.
    // Enumeration-prevention ("المستخدم غير موجود") is handled by the caller
    // (useRequestPasswordReset), not here — this endpoint just proxies the
    // server response as-is.
    requestPasswordReset: builder.mutation<void, RequestPasswordResetRequest>({
      query: body => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    verifyPasswordResetOtp: builder.mutation<void, VerifyPasswordResetOtpRequest>({
      query: body => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    resendPasswordResetOtp: builder.mutation<void, ResendPasswordResetOtpRequest>({
      query: body => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: body => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRegisterFcmTokenMutation,
  useRequestPasswordResetMutation,
  useVerifyPasswordResetOtpMutation,
  useResendPasswordResetOtpMutation,
  useResetPasswordMutation,
} = authApi;
