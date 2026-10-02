import { authStorage } from '@/core/storage';
import { notificationManager } from '@/core/notification';
import {
  setUser,
  setToken,
  clearCredentials,
  phoneOtpSent,
} from '../store';
import type {
  LoginRequest,
  LoginResponse,
  User,
  RegisterDevicePayload,
  RequestPasswordResetRequest,
  ResendPasswordResetOtpRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  LogoutRequest,
  VerifyPhoneOtpRequest,
  ResendPhoneOtpRequest,
} from '../store';
import { baseApi } from '@/core/api';

// Logout waits on this before signing out locally; it must never hang the UI.
const LOGOUT_TIMEOUT_MS = 5000;

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Phone+password login. No `user` object is returned — `user` is
    // hydrated separately by GET /user/me once the token is set.
    // Routing (Main vs the registration-resume gate) follows automatically
    // from AppStatus once `isOnboardingComplete` is in the store — no
    // imperative navigation here.
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          authStorage.saveToken(data.token);
          dispatch(
            setToken({
              token: data.token,
              userType: data.user_type,
              currentStep: data.current_step,
              isOnboardingComplete: data.is_onboarding_complete,
              phone: arg.phone,
            }),
          );
        } catch {}
      },
    }),
    // Background sync (contract §11.1), driven by `useDeviceRegistration`.
    registerDevice: builder.mutation<void, RegisterDevicePayload>({
      query: body => ({ url: '/user/devices', method: 'POST', body }),
      extraOptions: { silent: true },
    }),
    // Works for suspended accounts too (contract §15.13).
    logout: builder.mutation<void, void>({
      query: () => {
        const fcmToken = notificationManager.getSavedToken();
        // Without it this device keeps receiving the signed-out user's pushes.
        const body: LogoutRequest = fcmToken ? { fcm_token: fcmToken } : {};
        return { url: '/auth/logout', method: 'POST', body, timeout: LOGOUT_TIMEOUT_MS };
      },
      extraOptions: { silent: true },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Best-effort: offline, timeout or an expired session (401) still
          // signs out locally below.
        } finally {
          await authStorage.clearSession();
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    getProfile: builder.query<User, void>({
      query: () => '/user/me',
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
    // Forgot password, step 1: always 200 even for unknown phones (no account
    // enumeration). The code is checked only by reset-password — verify-otp
    // would consume it (contract §15.12).
    requestPasswordReset: builder.mutation<void, RequestPasswordResetRequest>({
      query: body => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resendPasswordResetOtp: builder.mutation<void, ResendPasswordResetOtpRequest>({
      query: body => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: body => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    // Registration phone verification (4-digit OTP, sent after step-1).
    verifyPhoneOtp: builder.mutation<void, VerifyPhoneOtpRequest>({
      query: body => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    // Throttled server-side (60s); the timestamp drives the UI countdown.
    resendPhoneOtp: builder.mutation<void, ResendPhoneOtpRequest>({
      query: body => ({ url: '/auth/resend-otp', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(phoneOtpSent(Date.now()));
        } catch {}
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRegisterDeviceMutation,
  useRequestPasswordResetMutation,
  useResendPasswordResetOtpMutation,
  useResetPasswordMutation,
  useVerifyPhoneOtpMutation,
  useResendPhoneOtpMutation,
} = authApi;
