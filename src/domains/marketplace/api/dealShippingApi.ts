import { baseApi, normalizeApiError } from '@/core/api';
import type { DealActionResult, DealShippingAddress } from '../types/deal';
import type { DealActionMetaDto, DealDto, DealShippingAddressDto } from '../types/dealDto';
import { isDealConflictError } from '../utils/dealAction';
import { mapDealActionResult, mapShippingAddress } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import { dealChangedTags, dealsApi } from './dealsApi';

interface DealEnvelopeDto {
  data: DealDto;
  meta: DealActionMetaDto;
}

/**
 * Shipping (handoff M5, B5.1). Ship, edit, receive, cancel and the address edit answer the full
 * deal through `runDealAction`; the issue report is multipart (photos ride in the request), so it
 * gets its own mutation that settles the cache the same way.
 */
export const dealShippingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Creator: the address they used last, to prefill a new deal's (`null` = none yet). */
    getShippingAddressPrefill: builder.query<DealShippingAddress | null, void>({
      query: () => '/influencer/shipping-address',
      transformResponse: (dto: DealShippingAddressDto | null) => (dto ? mapShippingAddress(dto) : null),
      // PII: dropped soon after the sheet closes (rule 07).
      keepUnusedDataFor: 30,
    }),
    /** Creator: `reason`, `note?`, `photos[]` as multipart; the deal answers like any action. */
    reportShipmentIssue: builder.mutation<DealActionResult, { id: string; form: FormData }>({
      query: ({ id, form }) => ({
        url: buildDealUrl({ role: 'creator', id }, 'shipment/issue'),
        method: 'POST',
        body: form,
      }),
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: DealEnvelopeDto) => mapDealActionResult(data, meta),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            dealsApi.util.upsertQueryData(
              'getDeal',
              { role: 'creator', id },
              { deal: data.deal, funding: data.funding },
            ),
          );
        } catch {
          // The hook reports the failure; a conflict refetches through the tags below.
        }
      },
      invalidatesTags: (_result, error, { id }) => {
        if (!error) return [...dealChangedTags(id)];
        return isDealConflictError(normalizeApiError(error))
          ? [{ type: 'Deal', id }, ...dealChangedTags(id)]
          : [];
      },
    }),
  }),
});

export const { useLazyGetShippingAddressPrefillQuery, useReportShipmentIssueMutation } = dealShippingApi;
