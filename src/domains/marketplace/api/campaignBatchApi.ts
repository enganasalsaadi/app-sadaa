import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import type { CampaignDropBoard } from '../types/campaignDrop';
import type { CampaignDropDto } from '../types/campaignDropDto';
import type { CampaignShipmentInput, CampaignShipmentReport, CampaignShippingBoard } from '../types/campaignShipping';
import type { CampaignShipmentReportDto, CampaignShippingDto } from '../types/campaignShippingDto';
import { mapCampaignDrop } from '../utils/campaignDropMappers';
import { buildBrandCampaignUrl } from '../utils/campaignQuery';
import { mapCampaignShipmentReport, mapCampaignShipping } from '../utils/campaignShippingMappers';

export interface ShipCampaignBatchArgs {
  id: string;
  /** 1–20 parcels, distinct deals (the screen sends them in chunks). */
  shipments: CampaignShipmentInput[];
  /** One per user intent and chunk (rule 06): a retry of the same chunk replays instead of shipping twice. */
  idempotencyKey: string;
}

/** Brand batch tools of one campaign (contract §3.7–§3.8): the launch room and the shipping manifest. */
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
    /**
     * The shipping manifest. Reading it makes the server log that this brand viewed the creators'
     * addresses (audit), so it is read once per visit (`refetchOnMountOrArgChange` in the screen)
     * and the cache is dropped soon after: the addresses are PII (rule 07). `422 campaign_no_shipping`
     * passes through (the campaign ships nothing).
     */
    getCampaignShipping: builder.query<CampaignShippingBoard, string>({
      query: id => buildBrandCampaignUrl(id, 'shipping'),
      transformResponse: (dto: CampaignShippingDto) => mapCampaignShipping(dto),
      providesTags: (_result, _error, id) => [{ type: 'CampaignShipping', id }],
      keepUnusedDataFor: 30,
    }),
    /**
     * Ships up to 20 parcels at once. The server answers 200 with a report per row, so a failed row
     * is data, not an error; the shipped ones settle their deals' caches. The manifest itself is not
     * invalidated: the screen merges the report and keeps failed rows editable where they are.
     */
    shipCampaignBatch: builder.mutation<CampaignShipmentReport, ShipCampaignBatchArgs>({
      query: ({ id, shipments, idempotencyKey }) => ({
        url: buildBrandCampaignUrl(id, 'shipments'),
        method: 'POST',
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
        body: {
          shipments: shipments.map(({ dealId, courier, trackingNo, trackingUrl }) => ({
            deal_id: dealId,
            courier,
            tracking_no: trackingNo,
            ...(trackingUrl ? { tracking_url: trackingUrl } : {}),
          })),
        },
      }),
      transformResponse: (dto: CampaignShipmentReportDto) => mapCampaignShipmentReport(dto),
      invalidatesTags: (result, _error, { id }) => {
        const shipped = result?.results.flatMap(row => (row.ok ? [row.dealId] : [])) ?? [];
        if (shipped.length === 0) return [];
        return [
          { type: 'CampaignDrop', id },
          { type: 'DealList', id: 'LIST' },
          'BrandHome',
          ...shipped.flatMap(dealId => [
            { type: 'Deal' as const, id: dealId },
            { type: 'DealHistory' as const, id: dealId },
          ]),
        ];
      },
    }),
  }),
});

export const { useGetCampaignDropQuery, useGetCampaignShippingQuery, useShipCampaignBatchMutation } =
  campaignBatchApi;
