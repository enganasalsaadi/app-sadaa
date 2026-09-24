import { authStorage } from '@/core/storage';
import { replace } from '@/core/navigation';
import { setCredentials, setUser, clearCredentials } from '../store';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  AuthResponse,
  User,
  RegisterFcmTokenPayload,
  ForgotPasswordRequest,
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
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
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
    // Forgot Password (link-based): emails a reset link; user finishes on web.
    // Always resolves 200 with the same message (no account enumeration).
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: body => ({ url: '/auth/forgot-password', method: 'POST', body }),
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
  useForgotPasswordMutation,
} = authApi;
