import { baseApi } from '@/core/api';
import type { WithMeta } from '@/core/api';
import type {
  MediaKit,
  MediaKitStats,
  PublicMediaKit,
  PublicMediaKitResult,
  SetKitShortlistedRequest,
  ShareMediaKitRequest,
  ShareMediaKitResult,
  SlugCheck,
  StatsPeriod,
  TrackMediaKitViewRequest,
  UpdateMediaKitRequest,
} from '../types/mediaKit';
import { mapPublicMediaKit } from '../utils/mapPublicMediaKit';

// Contract §17.6 still names it `X-…`; money endpoints use the standard `IDEMPOTENCY_HEADER`.
const SHARE_IDEMPOTENCY_HEADER = 'X-Idempotency-Key';

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
        headers: { [SHARE_IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      invalidatesTags: ['MediaKitStats'],
    }),
    /** Contract §17.4: read-only; `canonicalSlug` set when an old slug was opened. */
    getPublicMediaKit: builder.query<PublicMediaKitResult, string>({
      query: slug => `/public/creators/${encodeURIComponent(slug)}`,
      extraOptions: { withMeta: true },
      transformResponse: (response: WithMeta<PublicMediaKit>, _meta, slug) =>
        mapPublicMediaKit(response, slug),
      // A locked body also hangs on `User`: every verification / company-info save and
      // every push invalidates it, so a brand who just got verified never reuses it (§6).
      providesTags: (result, _error, slug) =>
        result?.kit.price_locked
          ? [{ type: 'PublicMediaKit', id: slug }, 'User']
          : [{ type: 'PublicMediaKit', id: slug }],
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

/** The owner's cover is on the public page too, so only that creator's cached page goes stale. */
const coverTags = (result: MediaKit | undefined) =>
  result ? [{ type: 'PublicMediaKit' as const, id: result.slug }] : [];

// Second injection so these can write into `getMediaKit` / `getPublicMediaKit` through a typed `util`.
const mediaKitMutationsApi = mediaKitApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * Contract §17.11: multipart `cover`. The server center-crops to 1500×600 and answers with
     * the §17.1 kit, which replaces the cached one so the new cover shows everywhere at once.
     * 429 after 10/h.
     */
    uploadMediaKitCover: builder.mutation<MediaKit, FormData>({
      query: body => ({ url: '/influencer/media-kit/cover', method: 'POST', body }),
      invalidatesTags: coverTags,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(mediaKitApi.util.upsertQueryData('getMediaKit', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    /** Contract §17.11: idempotent; answers with the §17.1 kit and `preview.cover_url: null`. */
    removeMediaKitCover: builder.mutation<MediaKit, void>({
      query: () => ({ url: '/influencer/media-kit/cover', method: 'DELETE' }),
      invalidatesTags: coverTags,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(mediaKitApi.util.upsertQueryData('getMediaKit', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    /**
     * Brand-explore §5 shortlist PUT/DELETE (idempotent, 204) from the kit itself. Flips the
     * kit's ❤️ at once and rolls back on failure; Explore, Home rails and the Shortlist list
     * live in marketplace, so they refetch through their tags instead of a cross-domain patch.
     */
    setKitShortlisted: builder.mutation<void, SetKitShortlistedRequest>({
      query: ({ slug, shortlisted }) => ({
        url: `/brand/shortlist/${encodeURIComponent(slug)}`,
        method: shortlisted ? 'PUT' : 'DELETE',
      }),
      async onQueryStarted({ slug, shortlisted }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mediaKitApi.util.updateQueryData('getPublicMediaKit', slug, draft => {
            draft.kit.is_shortlisted = shortlisted;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [{ type: 'Shortlist', id: 'LIST' }, { type: 'ExploreCreators', id: 'LIST' }, 'BrandHome'],
    }),
  }),
});

export const {
  useSetKitShortlistedMutation,
  useUploadMediaKitCoverMutation,
  useRemoveMediaKitCoverMutation,
} = mediaKitMutationsApi;
