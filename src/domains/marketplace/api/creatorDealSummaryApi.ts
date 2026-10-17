import { baseApi } from '@/core/api';
import type { CreatorDealSummary } from '../types/deal';
import type { CreatorDealSummaryDto } from '../types/dealDto';
import { mapCreatorCampaignsGlance } from '../utils/campaignHomeMappers';
import { mapCreatorDealSummary } from '../utils/dealMappers';

export const creatorDealSummaryApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** B14: the creator's open deals + «your turn» counts. Server sorts; the badge is `needsActionCount`. */
    getCreatorDealSummary: builder.query<CreatorDealSummary, void>({
      query: () => '/influencer/deals/summary',
      transformResponse: (dto: CreatorDealSummaryDto): CreatorDealSummary => ({
        ...mapCreatorDealSummary(dto),
        campaigns: mapCreatorCampaignsGlance(dto.campaigns),
      }),
      keepUnusedDataFor: 300,
      providesTags: ['CreatorDealSummary'],
    }),
  }),
});

export const { useGetCreatorDealSummaryQuery } = creatorDealSummaryApi;
