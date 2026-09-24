import { baseApi } from '@/core/api';
import type { User } from '@/domains/auth';

export type NotificationSettings = {
  booking_confirmations: boolean;
  booking_reminders: boolean;
  review_requests: boolean;
  promotions: boolean;
};

export interface AccountPreferences {
  language: string;
  currency: string;
  notifications: NotificationSettings;
  car_notifications?: NotificationSettings;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePreferencesRequest {
  language?: string;
  currency?: string;
  notifications?: Partial<NotificationSettings>;
  car_notifications?: Partial<NotificationSettings>;
}

export const accountApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getPreferences: builder.query<AccountPreferences, void>({
      query: () => '/account/preferences',
      providesTags: ['Preferences'],
    }),
    updatePreferences: builder.mutation<
      AccountPreferences,
      UpdatePreferencesRequest
    >({
      query: body => ({ url: '/account/preferences', method: 'PUT', body }),
      invalidatesTags: ['Preferences'],
    }),
    updateAvatar: builder.mutation<User, FormData>({
      query: body => ({
        url: '/account/avatar',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: body => ({ url: '/account/password', method: 'POST', body }),
    }),
    deleteAccount: builder.mutation<void, { password: string }>({
      query: body => ({ url: '/account', method: 'DELETE', body }),
    }),
  }),
});

export const {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = accountApi;
