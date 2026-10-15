import { baseApi, normalizeApiError } from '@/core/api';
import { mapUploadSlot, type UploadSlot, type UploadSlotDto, type UploadSlotRequest } from '@/core/upload';
import type { DealDisputeDetail, DealRef } from '../types/deal';
import type { DealDisputeDto } from '../types/dealDto';
import { isDealConflictError } from '../utils/dealAction';
import { mapDealDisputeDetail } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import { dealChangedTags } from './dealsApi';

interface DisputeWriteArgs {
  ref: DealRef;
  body: Record<string, unknown>;
}

/**
 * Opening moves the deal to `disputed` and evidence adds history, so both refetch the deal and
 * what moves with it (its history tag refetches the disputes too). A `deal_*` conflict (409, or
 * 403 on disputes) refetches the same way: the deal moved under the user. Other failures change nothing.
 */
const disputeWriteTags = (error: unknown, id: string) =>
  error && !isDealConflictError(normalizeApiError(error))
    ? []
    : [{ type: 'Deal' as const, id }, ...dealChangedTags(id)];

/**
 * Disputes (handoff M9), both roles. Opening and adding evidence answer the dispute with its
 * thread, not the deal, so they have their own mutations; withdrawing answers the deal and goes
 * through `runDealAction` (`dispute/withdraw`).
 */
export const dealDisputeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Every dispute on the deal with its evidence thread, oldest first (at most two). */
    getDealDisputes: builder.query<DealDisputeDetail[], DealRef>({
      query: ref => buildDealUrl(ref, 'disputes'),
      transformResponse: (dtos: DealDisputeDto[]) => dtos.map(mapDealDisputeDetail),
      providesTags: (_result, _error, { id }) => [{ type: 'DealHistory', id }],
    }),
    /** A signed slot for one evidence file (step 1 of 3). */
    requestEvidenceUploadSlot: builder.mutation<UploadSlot, { ref: DealRef; request: UploadSlotRequest }>({
      query: ({ ref, request }) => ({
        url: buildDealUrl(ref, 'dispute/uploads'),
        method: 'POST',
        body: request,
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** `{reason, statement}`; the statement becomes the opener's first entry. */
    openDealDispute: builder.mutation<DealDisputeDetail, DisputeWriteArgs>({
      query: ({ ref, body }) => ({ url: buildDealUrl(ref, 'dispute'), method: 'POST', body }),
      transformResponse: (dto: DealDisputeDto) => mapDealDisputeDetail(dto),
      invalidatesTags: (_result, error, { ref }) => disputeWriteTags(error, ref.id),
    }),
    /** `{note, links?, file_ids?, refs?}` while the evidence window is open. */
    addDealDisputeEvidence: builder.mutation<DealDisputeDetail, DisputeWriteArgs>({
      query: ({ ref, body }) => ({ url: buildDealUrl(ref, 'dispute/evidence'), method: 'POST', body }),
      transformResponse: (dto: DealDisputeDto) => mapDealDisputeDetail(dto),
      invalidatesTags: (_result, error, { ref }) => disputeWriteTags(error, ref.id),
    }),
  }),
});

export const {
  useGetDealDisputesQuery,
  useRequestEvidenceUploadSlotMutation,
  useOpenDealDisputeMutation,
  useAddDealDisputeEvidenceMutation,
} = dealDisputeApi;
