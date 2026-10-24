import { baseApi, IDEMPOTENCY_HEADER, normalizeApiError } from '@/core/api';
import type {
  CampaignApplyArgs,
  CampaignPage,
  CreatorApplication,
  CreatorApplicationsArgs,
  CreatorCampaign,
  CreatorCampaignDetail,
  CreatorFeedArgs,
} from '../types/campaign';
import type {
  CampaignPageDto,
  CreatorApplicationDto,
  CreatorCampaignDetailDto,
  CreatorCampaignDto,
} from '../types/campaignDto';
import {
  mapCreatorApplication,
  mapCreatorApplicationsPage,
  mapCreatorCampaignDetail,
  mapCreatorCampaignsPage,
} from '../utils/campaignMappers';
import {
  buildCreatorApplicationsUrl,
  buildCreatorApplyUrl,
  buildCreatorApplicationUrl,
  buildCreatorBookmarkUrl,
  buildCreatorCampaignUrl,
  buildCreatorFeedUrl,
  buildCreatorSavedUrl,
  buildCreatorWithdrawUrl,
} from '../utils/campaignQuery';
import { toApplyBody } from '../utils/campaignApply';
import { setBookmarkedIn } from '../utils/opportunities';

/** The refusals that mean the page's own read (accepting, eligibility) is out of date. */
const STALE_PAGE_CODES = ['campaign_not_accepting', 'campaign_not_eligible'];

const nextPage = ({ meta }: CampaignPage<unknown>) =>
  meta.currentPage < meta.lastPage ? meta.currentPage + 1 : undefined;

/** Creator side of Public Campaigns: feed, saved, detail and «my applications» reads (contract §4). */
export const creatorCampaignsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Already gated and ranked by the server; the server filters are the cache key. */
    getCampaignFeed: builder.infiniteQuery<CampaignPage<CreatorCampaign>, CreatorFeedArgs, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ queryArg, pageParam }) => buildCreatorFeedUrl(queryArg, pageParam),
      transformResponse: (dto: CampaignPageDto<CreatorCampaignDto>) => mapCreatorCampaignsPage(dto),
      providesTags: [{ type: 'CreatorCampaignList', id: 'FEED' }],
    }),
    /** Bookmarks, newest save first. */
    getSavedCampaigns: builder.infiniteQuery<CampaignPage<CreatorCampaign>, void, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ pageParam }) => buildCreatorSavedUrl(pageParam),
      transformResponse: (dto: CampaignPageDto<CreatorCampaignDto>) => mapCreatorCampaignsPage(dto),
      providesTags: [{ type: 'CreatorCampaignList', id: 'SAVED' }],
    }),
    /** Opening it marks an invitation as seen, so the summary's `newInvites` moves with it. */
    getCreatorCampaign: builder.query<CreatorCampaignDetail, string>({
      query: id => buildCreatorCampaignUrl(id),
      transformResponse: (dto: CreatorCampaignDetailDto) => mapCreatorCampaignDetail(dto),
      providesTags: (_result, _error, id) => [{ type: 'CreatorCampaign', id }],
    }),
    /**
     * Save / unsave one campaign. Every loaded copy flips at once (feed, saved, the page); a refusal
     * puts them back and re-reads the feed, since a campaign that stopped recruiting can't be saved.
     */
    setCampaignBookmarked: builder.mutation<void, { id: string; bookmarked: boolean }>({
      query: ({ id, bookmarked }) => ({
        url: buildCreatorBookmarkUrl(id),
        method: bookmarked ? 'POST' : 'DELETE',
      }),
      transformResponse: () => undefined,
      async onQueryStarted({ id, bookmarked }, { dispatch, getState, queryFulfilled }) {
        const state = getState();
        const patches = [
          ...creatorCampaignsApi.util.selectCachedArgsForQuery(state, 'getCampaignFeed').map(args =>
            dispatch(
              creatorCampaignsApi.util.updateQueryData('getCampaignFeed', args, draft => {
                draft.pages.forEach(page => setBookmarkedIn(page.items, id, bookmarked));
              }),
            ),
          ),
          // Saving adds a row only the server can place (newest first), so that one is re-read after.
          ...(bookmarked
            ? []
            : [
                dispatch(
                  creatorCampaignsApi.util.updateQueryData('getSavedCampaigns', undefined, draft => {
                    draft.pages.forEach(page => {
                      page.items = page.items.filter(item => item.id !== id);
                    });
                  }),
                ),
              ]),
          dispatch(
            creatorCampaignsApi.util.updateQueryData('getCreatorCampaign', id, draft => {
              draft.bookmarked = bookmarked;
            }),
          ),
        ];
        try {
          await queryFulfilled;
          if (bookmarked) dispatch(creatorCampaignsApi.util.invalidateTags([{ type: 'CreatorCampaignList', id: 'SAVED' }]));
        } catch {
          patches.forEach(patch => patch.undo());
          dispatch(creatorCampaignsApi.util.invalidateTags([{ type: 'CreatorCampaignList', id: 'FEED' }]));
        }
      },
    }),
    getCampaignApplications: builder.infiniteQuery<
      CampaignPage<CreatorApplication>,
      CreatorApplicationsArgs,
      number
    >({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ queryArg, pageParam }) => buildCreatorApplicationsUrl(queryArg, pageParam),
      transformResponse: (dto: CampaignPageDto<CreatorApplicationDto>) =>
        mapCreatorApplicationsPage(dto),
      providesTags: [{ type: 'CampaignApplicationList', id: 'LIST' }],
    }),
    getCampaignApplication: builder.query<CreatorApplication, string>({
      query: id => buildCreatorApplicationUrl(id),
      transformResponse: (dto: CreatorApplicationDto) => mapCreatorApplication(dto),
      providesTags: (_result, _error, id) => [{ type: 'CampaignApplication', id }],
    }),
    /**
     * The signed, binding application (contract §4.2): one idempotency key per intent. It leaves the
     * feed, flags the page «applied» and joins «my applications»; a refusal that says the page is out
     * of date re-reads it.
     */
    applyToCampaign: builder.mutation<CreatorApplication, CampaignApplyArgs>({
      query: args => ({
        url: buildCreatorApplyUrl(args.id),
        method: 'POST',
        body: toApplyBody(args),
        headers: { [IDEMPOTENCY_HEADER]: args.idempotencyKey },
      }),
      transformResponse: (dto: CreatorApplicationDto) => mapCreatorApplication(dto),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(creatorCampaignsApi.util.upsertQueryData('getCampaignApplication', data.id, data));
        } catch {
          // The sheet reports the refusal.
        }
      },
      invalidatesTags: (_result, error, { id }) => {
        if (!error) {
          return [
            { type: 'CreatorCampaign', id },
            { type: 'CreatorCampaignList', id: 'FEED' },
            { type: 'CreatorCampaignList', id: 'SAVED' },
            { type: 'CampaignApplicationList', id: 'LIST' },
            // The home glance counts the feed and the open applications.
            'CreatorDealSummary',
          ];
        }
        const code = normalizeApiError(error).code;
        return code && STALE_PAGE_CODES.includes(code) ? [{ type: 'CreatorCampaign', id }] : [];
      },
    }),
    /**
     * Takes a pending application back (contract §4.3): no penalty, no way to apply again. A decided one
     * answers 409, and either way the lists are re-read so the card lands in its real tab. Success
     * already cached the answer, so only a refusal re-reads the application itself; the campaign page
     * (no more Apply) and the home glance's open count move with it.
     */
    withdrawCampaignApplication: builder.mutation<CreatorApplication, string>({
      query: id => ({ url: buildCreatorWithdrawUrl(id), method: 'POST' }),
      transformResponse: (dto: CreatorApplicationDto) => mapCreatorApplication(dto),
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(creatorCampaignsApi.util.upsertQueryData('getCampaignApplication', data.id, data));
        } catch {
          // The sheet reports the refusal.
        }
      },
      invalidatesTags: (result, _error, id) =>
        result
          ? [
              { type: 'CampaignApplicationList', id: 'LIST' },
              { type: 'CreatorCampaign', id: result.campaign.id },
              'CreatorDealSummary',
            ]
          : [
              { type: 'CampaignApplication', id },
              { type: 'CampaignApplicationList', id: 'LIST' },
            ],
    }),
  }),
});

export const {
  useGetCampaignFeedInfiniteQuery,
  useGetSavedCampaignsInfiniteQuery,
  useGetCreatorCampaignQuery,
  useSetCampaignBookmarkedMutation,
  useGetCampaignApplicationsInfiniteQuery,
  useGetCampaignApplicationQuery,
  useApplyToCampaignMutation,
  useWithdrawCampaignApplicationMutation,
} = creatorCampaignsApi;
