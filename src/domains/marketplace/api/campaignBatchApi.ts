import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import type { CampaignPage } from '../types/campaign';
import type { CampaignPageDto } from '../types/campaignDto';
import type { CampaignAnnouncement, CampaignAnnouncementInput } from '../types/campaignAnnouncement';
import type { CampaignAnnouncementDto } from '../types/campaignAnnouncementDto';
import type { CampaignDropBoard } from '../types/campaignDrop';
import type { CampaignDropDto } from '../types/campaignDropDto';
import type { CampaignShipmentInput, CampaignShipmentReport, CampaignShippingBoard } from '../types/campaignShipping';
import type { CampaignShipmentReportDto, CampaignShippingDto } from '../types/campaignShippingDto';
import { mapCampaignAnnouncement, mapCampaignAnnouncementsPage } from '../utils/campaignAnnouncementMappers';
import { mapCampaignDrop } from '../utils/campaignDropMappers';
import { buildBrandAnnouncementsUrl, buildBrandCampaignUrl } from '../utils/campaignQuery';
import { mapCampaignShipmentReport, mapCampaignShipping } from '../utils/campaignShippingMappers';

export interface ShipCampaignBatchArgs {
  id: string;
  /** 1–20 parcels, distinct deals (the screen sends them in chunks). */
  shipments: CampaignShipmentInput[];
  /**
   * One per user intent and chunk (rule 06). The server dedups per row instead: a row whose deal's
   * latest shipment has the same courier + tracking number answers `ok` with that shipment.
   */
  idempotencyKey: string;
}

export interface SendCampaignAnnouncementArgs extends CampaignAnnouncementInput {
  id: string;
  /** One per user intent (rule 06): a retry of the same message replays instead of broadcasting twice. */
  idempotencyKey: string;
}

/** Brand batch tools of one campaign (contract §3.7–§3.9): the launch room, the shipping manifest and the broadcasts. */
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
          shipments: shipments.map(({ dealId, courier, courierName, trackingNo, trackingUrl }) => ({
            deal_id: dealId,
            courier,
            ...(courierName ? { courier_name: courierName } : {}),
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
    /** The broadcast history, newest first; the first page is what the daily quota is counted from. */
    getCampaignAnnouncements: builder.infiniteQuery<CampaignPage<CampaignAnnouncement>, string, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) => (meta.currentPage < meta.lastPage ? meta.currentPage + 1 : undefined),
      },
      query: ({ queryArg, pageParam }) => buildBrandAnnouncementsUrl(queryArg, pageParam),
      transformResponse: (dto: CampaignPageDto<CampaignAnnouncementDto>) => mapCampaignAnnouncementsPage(dto),
      providesTags: (_result, _error, id) => [{ type: 'CampaignAnnouncements', id }],
    }),
    /**
     * Broadcasts to every creator on a funded linked deal (201). `429 campaign_announcement_limit`
     * (with `meta.next_available_at`) and `422 campaign_no_announcement_recipients` pass through for
     * the screen. A sent one stales the history, which is where the quota comes from.
     */
    sendCampaignAnnouncement: builder.mutation<CampaignAnnouncement, SendCampaignAnnouncementArgs>({
      query: ({ id, body, link, idempotencyKey }) => ({
        url: buildBrandCampaignUrl(id, 'announcements'),
        method: 'POST',
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
        body: { body, ...(link ? { link } : {}) },
      }),
      transformResponse: (dto: CampaignAnnouncementDto) => mapCampaignAnnouncement(dto),
      invalidatesTags: (result, _error, { id }) => (result ? [{ type: 'CampaignAnnouncements', id }] : []),
    }),
  }),
});

export const {
  useGetCampaignDropQuery,
  useGetCampaignShippingQuery,
  useShipCampaignBatchMutation,
  useGetCampaignAnnouncementsInfiniteQuery,
  useSendCampaignAnnouncementMutation,
} = campaignBatchApi;
