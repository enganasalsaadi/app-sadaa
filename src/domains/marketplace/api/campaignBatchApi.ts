import { baseApi } from '@/core/api';
import type { CampaignDropBoard } from '../types/campaignDrop';
import type { CampaignDropDto } from '../types/campaignDropDto';
import { mapCampaignDrop } from '../utils/campaignDropMappers';
import { buildBrandCampaignUrl } from '../utils/campaignQuery';

/** Brand batch tools of one campaign (contract §3.7–§3.8): the launch room today. */
export const campaignBatchApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * The drop dashboard: countdown, totals and a row per linked creator. `409 campaign_no_drop`
     * passes through (the campaign has no drop). Staled by pull-to-refresh and by any campaign or
     * deal push (`campaignPushTags`), so it follows creators moving through the drop.
     */
    getCampaignDrop: builder.query<CampaignDropBoard, string>({
      query: id => buildBrandCampaignUrl(id, 'drop'),
      transformResponse: (dto: CampaignDropDto) => mapCampaignDrop(dto),
      providesTags: (_result, _error, id) => [{ type: 'CampaignDrop', id }],
    }),
  }),
});

export const { useGetCampaignDropQuery } = campaignBatchApi;
