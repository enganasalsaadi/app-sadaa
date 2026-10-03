import { baseApi } from '@/core/api';
import type { User } from '@/domains/auth';

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePreferencesRequest {
  language: string;
}

export const accountApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    updatePreferences: builder.mutation<void, UpdatePreferencesRequest>({
      query: body => ({ url: '/account/preferences', method: 'PUT', body }),
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
  }),
});

export const {
  useUpdatePreferencesMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
} = accountApi;
