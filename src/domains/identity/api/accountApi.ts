import { baseApi } from '@/core/api';
import type { BrandSocialLink } from '@/domains/auth';
import type { AvatarResponse, UserProfileDetails } from '../types/profile';
import { toUserProfileDetails } from '../utils/profileDetails';

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePreferencesRequest {
  language: string;
}

export interface UpdateInfluencerProfileRequest {
  full_name?: string;
  email?: string | null;
  governorate?: string;
  area?: string | null;
  niches?: string[];
}

export interface UpdateBrandProfileRequest {
  company_name?: string;
  email?: string | null;
  governorate?: string;
  business_type?: string;
  /** Full replace: always the whole list (`[]` removes all). */
  social_links?: BrandSocialLink[];
}

export const accountApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    updatePreferences: builder.mutation<void, UpdatePreferencesRequest>({
      query: body => ({ url: '/account/preferences', method: 'PUT', body }),
    }),
    getUserProfile: builder.query<UserProfileDetails, void>({
      query: () => '/user/profile',
      transformResponse: toUserProfileDetails,
      providesTags: ['Profile'],
    }),
    /** Contract §8.1: partial, send only what changed; answers with the §3.2 profile. */
    updateInfluencerProfile: builder.mutation<UserProfileDetails, UpdateInfluencerProfileRequest>({
      query: body => ({ url: '/influencer/profile', method: 'PATCH', body }),
      transformResponse: toUserProfileDetails,
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(accountApi.util.upsertQueryData('getUserProfile', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    /** Contract §8.2: partial, email applies at once; answers with the §3.2 profile. */
    updateBrandProfile: builder.mutation<UserProfileDetails, UpdateBrandProfileRequest>({
      query: body => ({ url: '/brand/profile', method: 'PATCH', body }),
      transformResponse: toUserProfileDetails,
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(accountApi.util.upsertQueryData('getUserProfile', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    updateAvatar: builder.mutation<AvatarResponse, FormData>({
      query: body => ({ url: '/user/avatar', method: 'POST', body }),
      invalidatesTags: ['User', 'Profile'],
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: body => ({ url: '/account/password', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdatePreferencesMutation,
  useUpdateAvatarMutation,
  useUpdateInfluencerProfileMutation,
  useUpdateBrandProfileMutation,
  useChangePasswordMutation,
} = accountApi;
