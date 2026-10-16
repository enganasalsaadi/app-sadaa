import { baseApi, IDEMPOTENCY_HEADER, normalizeApiError } from '@/core/api';
import type {
  CampaignActionArgs,
  CampaignActionResult,
  CampaignDetail,
  CampaignHistoryRow,
  CampaignListArgs,
  CampaignPage,
  Campaign,
} from '../types/campaign';
import type {
  CampaignActionDataDto,
  CampaignActionMetaDto,
  CampaignDetailDto,
  CampaignDto,
  CampaignHistoryRowDto,
  CampaignPageDto,
} from '../types/campaignDto';
import { isCampaignConflictError } from '../utils/campaignAction';
import {
  mapCampaignActionResult,
  mapCampaignDetail,
  mapCampaignHistoryRow,
  mapCampaignsPage,
} from '../utils/campaignMappers';
import { buildBrandCampaignUrl, buildBrandCampaignsUrl } from '../utils/campaignQuery';

/** A `withMeta` action response: the campaign in `data`, the `submit` wallet check maybe in `meta`. */
interface CampaignActionEnvelopeDto {
  data: CampaignActionDataDto;
  meta: CampaignActionMetaDto;
}

/**
 * What else moves when a campaign does: the list (status changes tab), its history (new rows) and
 * the brand home's campaigns rail. Each refetches only if on screen.
 */
export const campaignChangedTags = (id: string) =>
  [{ type: 'CampaignList', id: 'LIST' }, { type: 'CampaignHistory', id }, 'BrandHome'] as const;

/** Brand side of Public Campaigns: reads + the lifecycle actions answering the full campaign (contract §3). */
export const brandCampaignsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Latest activity first; the statuses are the cache key, so each tab keeps its pages. */
    getCampaigns: builder.infiniteQuery<CampaignPage<Campaign>, CampaignListArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.currentPage < meta.lastPage ? meta.currentPage + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => buildBrandCampaignsUrl(queryArg, pageParam),
      transformResponse: (dto: CampaignPageDto<CampaignDto>) => mapCampaignsPage(dto),
      providesTags: [{ type: 'CampaignList', id: 'LIST' }],
    }),
    getCampaign: builder.query<CampaignDetail, string>({
      query: id => buildBrandCampaignUrl(id),
      transformResponse: (dto: CampaignDetailDto) => mapCampaignDetail(dto),
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),
    /** Status changes + note rows (`from.key == to.key`), a plain array. */
    getCampaignHistory: builder.query<CampaignHistoryRow[], string>({
      query: id => buildBrandCampaignUrl(id, 'history'),
      transformResponse: (rows: CampaignHistoryRowDto[]) => rows.map(mapCampaignHistoryRow),
      providesTags: (_result, _error, id) => [{ type: 'CampaignHistory', id }],
    }),
    /**
     * Any lifecycle action answering the full campaign. Success replaces the cached detail with
     * `data` (no refetch; `duplicate` caches the new campaign); a `campaign_*` conflict (409)
     * refetches it, since it changed under the user. Go through `useCampaignAction`, which adds the
     * toast and idempotency.
     */
    runCampaignAction: builder.mutation<CampaignActionResult, CampaignActionArgs>({
      query: ({ id, path, body, idempotencyKey }) => ({
        url: buildBrandCampaignUrl(id, path),
        method: 'POST',
        body: body ?? {},
        ...(idempotencyKey ? { headers: { [IDEMPOTENCY_HEADER]: idempotencyKey } } : {}),
      }),
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: CampaignActionEnvelopeDto) =>
        mapCampaignActionResult(data, meta),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(brandCampaignsApi.util.upsertQueryData('getCampaign', data.campaign.id, data.campaign));
        } catch {
          // The caller reports the failure; a conflict refetches through the tags below.
        }
      },
      invalidatesTags: (_result, error, { id }) => {
        if (!error) return [...campaignChangedTags(id)];
        return isCampaignConflictError(normalizeApiError(error))
          ? [{ type: 'Campaign', id }, ...campaignChangedTags(id)]
          : [];
      },
    }),
  }),
});

export const {
  useGetCampaignsInfiniteQuery,
  useGetCampaignQuery,
  useGetCampaignHistoryQuery,
  useRunCampaignActionMutation,
} = brandCampaignsApi;
