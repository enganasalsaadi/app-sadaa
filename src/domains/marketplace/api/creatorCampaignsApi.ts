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
  buildCreatorCampaignUrl,
  buildCreatorFeedUrl,
  buildCreatorSavedUrl,
} from '../utils/campaignQuery';

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
  useGetCampaignApplicationsInfiniteQuery,
  useGetCampaignApplicationQuery,
} = creatorCampaignsApi;
