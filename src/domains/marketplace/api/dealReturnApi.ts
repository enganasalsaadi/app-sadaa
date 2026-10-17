import { baseApi, normalizeApiError } from '@/core/api';
import type { DealActionResult } from '../types/deal';
import type { DealActionMetaDto, DealDto } from '../types/dealDto';
import { isDealConflictError } from '../utils/dealAction';
import { mapDealActionResult } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import { dealChangedTags, dealsApi } from './dealsApi';

interface DealEnvelopeDto {
  data: DealDto;
  meta: DealActionMetaDto;
}

/**
 * The brand's answer to a returned sample (PC9.2, contract §5.5). Receive and waive answer the full
 * deal through `runDealAction`; the problem report is multipart (photos ride in the request), so it
 * gets its own mutation that settles the cache the same way.
 */
export const dealReturnApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Brand: `note` (5–1000) and `photos[]` (≤ 5) as multipart; the deal answers like any action. */
    reportReturnIssue: builder.mutation<DealActionResult, { id: string; form: FormData }>({
      query: ({ id, form }) => ({
        url: buildDealUrl({ role: 'brand', id }, 'return-shipment/issue'),
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
              { role: 'brand', id },
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

export const { useReportReturnIssueMutation } = dealReturnApi;
