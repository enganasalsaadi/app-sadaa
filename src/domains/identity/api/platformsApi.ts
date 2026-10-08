import { baseApi } from '@/core/api';
import type { FollowerTierId, PlatformResource } from '@/domains/auth';

/** The refresh runs a provider lookup, which may take up to 30 s (contract §4). */
const PLATFORM_REFRESH_TIMEOUT_MS = 35_000;

export interface AddPlatformRequest {
  platform: string;
  handle: string;
  follower_tier?: FollowerTierId;
  is_primary?: boolean;
}

export interface UpdatePlatformRequest {
  id: string;
  handle: string;
  follower_tier?: FollowerTierId;
}

export interface PlatformAvailabilityRequest {
  id: string;
  is_available: boolean;
}

/** Writes that change `/me` (completion, tier, primary) and `/user/profile` (platforms). */
const PROFILE_TAGS = ['User', 'Profile'] as const;

/** In-app platform management (contract §5.3). */
export const platformsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getPlatforms: builder.query<PlatformResource[], void>({
      query: () => '/influencer/platforms',
      providesTags: ['Platform'],
    }),
    addPlatform: builder.mutation<PlatformResource, AddPlatformRequest>({
      query: body => ({ url: '/influencer/platforms', method: 'POST', body }),
      invalidatesTags: ['Platform', ...PROFILE_TAGS],
    }),
    updatePlatform: builder.mutation<PlatformResource, UpdatePlatformRequest>({
      query: ({ id, ...body }) => ({ url: `/influencer/platforms/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Platform', ...PROFILE_TAGS],
    }),
    // Its prices can't stay on an unlinked platform: re-read the cards and the kit.
    deletePlatform: builder.mutation<null, string>({
      query: id => ({ url: `/influencer/platforms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Platform', 'RateCard', 'MediaKit', ...PROFILE_TAGS],
    }),
    refreshPlatform: builder.mutation<PlatformResource, string>({
      query: id => ({
        url: `/influencer/platforms/${id}/refresh`,
        method: 'POST',
        timeout: PLATFORM_REFRESH_TIMEOUT_MS,
      }),
      invalidatesTags: ['Platform', ...PROFILE_TAGS],
    }),
    // Both answer with every platform: the toggle flips at once, the reply settles it.
    setPrimaryPlatform: builder.mutation<PlatformResource[], string>({
      query: id => ({ url: `/influencer/platforms/${id}/primary`, method: 'PATCH' }),
      invalidatesTags: [...PROFILE_TAGS],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          platformsApi.util.updateQueryData('getPlatforms', undefined, list => {
            for (const item of list) item.is_primary = item.id === id;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(platformsApi.util.upsertQueryData('getPlatforms', undefined, data));
        } catch {
          patch.undo();
        }
      },
    }),
    setPlatformAvailability: builder.mutation<PlatformResource[], PlatformAvailabilityRequest>({
      query: ({ id, is_available }) => ({
        url: `/influencer/platforms/${id}/availability`,
        method: 'PATCH',
        body: { is_available },
      }),
      invalidatesTags: [...PROFILE_TAGS],
      async onQueryStarted({ id, is_available }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          platformsApi.util.updateQueryData('getPlatforms', undefined, list => {
            const item = list.find(entry => entry.id === id);
            if (item) item.is_available = is_available;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(platformsApi.util.upsertQueryData('getPlatforms', undefined, data));
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetPlatformsQuery,
  useAddPlatformMutation,
  useUpdatePlatformMutation,
  useDeletePlatformMutation,
  useRefreshPlatformMutation,
  useSetPrimaryPlatformMutation,
  useSetPlatformAvailabilityMutation,
} = platformsApi;
