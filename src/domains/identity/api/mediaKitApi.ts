import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import type { WithMeta } from '@/core/api';
import type {
  MediaKit,
  MediaKitStats,
  PublicMediaKit,
  PublicMediaKitResult,
  ShareMediaKitRequest,
  ShareMediaKitResult,
  SlugCheck,
  StatsPeriod,
  TrackMediaKitViewRequest,
  UpdateMediaKitRequest,
} from '../types/mediaKit';
import { mapPublicMediaKit } from '../utils/mapPublicMediaKit';

export const mediaKitApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Contract §17.1. */
    getMediaKit: builder.query<MediaKit, void>({
      query: () => '/influencer/media-kit',
      providesTags: ['MediaKit'],
    }),
    /** Contract §17.2: partial; answers with the §17.1 shape. Throttle 10/h. */
    updateMediaKit: builder.mutation<MediaKit, UpdateMediaKitRequest>({
      query: body => ({ url: '/influencer/media-kit', method: 'PATCH', body }),
      invalidatesTags: ['MediaKit'],
    }),
    /** Contract §17.3: never cached (debounce ~400 ms in the caller). */
    checkMediaKitSlug: builder.query<SlugCheck, string>({
      query: slug => ({ url: '/influencer/media-kit/slug-check', params: { slug } }),
      keepUnusedDataFor: 0,
      extraOptions: { silent: true },
    }),
    /** Contract §17.7. */
    getMediaKitStats: builder.query<MediaKitStats, StatsPeriod | void>({
      query: period => ({
        url: '/influencer/media-kit/stats',
        params: { period: period ?? '30d' },
      }),
      providesTags: ['MediaKitStats'],
    }),
    /** Contract §17.6: 201 first time, 200 on a retry with the same key. */
    shareMediaKit: builder.mutation<ShareMediaKitResult, ShareMediaKitRequest>({
      query: ({ channel, idempotencyKey }) => ({
        url: '/influencer/media-kit/share',
        method: 'POST',
        body: { channel },
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      invalidatesTags: ['MediaKitStats'],
    }),
    /** Contract §17.4: read-only; `canonicalSlug` set when an old slug was opened. */
    getPublicMediaKit: builder.query<PublicMediaKitResult, string>({
      query: slug => `/public/creators/${encodeURIComponent(slug)}`,
      extraOptions: { withMeta: true },
      transformResponse: (response: WithMeta<PublicMediaKit>, _meta, slug) =>
        mapPublicMediaKit(response, slug),
      providesTags: (_result, _error, slug) => [{ type: 'PublicMediaKit', id: slug }],
    }),
    /** Contract §17.5: fire-and-forget, 202; the caller never awaits it or shows errors. */
    trackMediaKitView: builder.mutation<void, TrackMediaKitViewRequest>({
      query: ({ slug, src }) => ({
        url: `/public/creators/${encodeURIComponent(slug)}/views`,
        method: 'POST',
        body: { src },
      }),
      extraOptions: { silent: true },
    }),
  }),
});

export const {
  useGetMediaKitQuery,
  useUpdateMediaKitMutation,
  useLazyCheckMediaKitSlugQuery,
  useGetMediaKitStatsQuery,
  useShareMediaKitMutation,
  useGetPublicMediaKitQuery,
  useTrackMediaKitViewMutation,
} = mediaKitApi;
