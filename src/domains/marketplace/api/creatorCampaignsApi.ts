import { baseApi } from '@/core/api';
import type {
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
  buildCreatorApplicationUrl,
  buildCreatorBookmarkUrl,
  buildCreatorCampaignUrl,
  buildCreatorFeedUrl,
  buildCreatorSavedUrl,
} from '../utils/campaignQuery';
import { setBookmarkedIn } from '../utils/opportunities';

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
  }),
});

export const {
  useGetCampaignFeedInfiniteQuery,
  useGetSavedCampaignsInfiniteQuery,
  useGetCreatorCampaignQuery,
  useSetCampaignBookmarkedMutation,
  useGetCampaignApplicationsInfiniteQuery,
  useGetCampaignApplicationQuery,
} = creatorCampaignsApi;
