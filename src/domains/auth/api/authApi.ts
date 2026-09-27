import { authStorage } from '@/core/storage';
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
  RegisterFcmTokenPayload,
  RequestPasswordResetRequest,
  VerifyPasswordResetOtpRequest,
  ResendPasswordResetOtpRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  LogoutRequest,
  VerifyPhoneOtpRequest,
  ResendPhoneOtpRequest,
} from '../store';
import { baseApi } from '@/core/api';

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
    // Forgot Password (phone OTP wizard), step 1: sends a 4-digit code.
    // Enumeration-prevention ("المستخدم غير موجود") is handled by the caller
    // (useForgotPasswordScreen), not here — this endpoint just proxies the
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
  useRegisterFcmTokenMutation,
  useRequestPasswordResetMutation,
  useVerifyPasswordResetOtpMutation,
  useResendPasswordResetOtpMutation,
  useResetPasswordMutation,
  useVerifyPhoneOtpMutation,
  useResendPhoneOtpMutation,
} = authApi;
