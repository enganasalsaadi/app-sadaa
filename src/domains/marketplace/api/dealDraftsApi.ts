import { baseApi } from '@/core/api';
import { mapUploadSlot, type UploadSlot, type UploadSlotDto, type UploadSlotRequest } from '@/core/upload';
import type { DealDraft, DealItemRef, DealUpsellQuote } from '../types/deal';
import type { DealDraftDto, DealUpsellQuoteDto } from '../types/dealDto';
import { mapDealDraft, mapDealUpsellQuote } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';

const itemPath = (itemId: string, action: string) => `items/${itemId}/${action}`;

/**
 * Drafts and review (handoff M6). Submitting, approving and asking for a revision answer the full
 * deal, so they go through `runDealAction`; its success invalidates `DealHistory`, which refetches
 * the rounds here as well as the timeline.
 */
export const dealDraftsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Every round of one deliverable with the review it got, newest first. */
    getDealItemDrafts: builder.query<DealDraft[], DealItemRef>({
      query: ({ itemId, ...ref }) => buildDealUrl(ref, itemPath(itemId, 'drafts')),
      transformResponse: (dtos: DealDraftDto[]) => dtos.map(mapDealDraft),
      providesTags: (_result, _error, { id }) => [{ type: 'DealHistory', id }],
    }),
    /** Creator: a signed slot for one draft file (step 1 of 3). */
    requestDraftUploadSlot: builder.mutation<
      UploadSlot,
      { dealId: string; itemId: string; request: UploadSlotRequest }
    >({
      query: ({ dealId, itemId, request }) => ({
        url: buildDealUrl({ role: 'creator', id: dealId }, itemPath(itemId, 'uploads')),
        method: 'POST',
        body: request,
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** Brand: the price of one more revision round on an item, before signing it (M8). */
    quoteExtraRevision: builder.mutation<DealUpsellQuote, { dealId: string; itemId: string }>({
      query: ({ dealId, itemId }) => ({
        url: buildDealUrl({ role: 'brand', id: dealId }, 'upsells/quote'),
        method: 'POST',
        body: { kind: 'extra_revision', item_id: itemId },
      }),
      transformResponse: (dto: DealUpsellQuoteDto) => mapDealUpsellQuote(dto),
    }),
  }),
});

export const {
  useGetDealItemDraftsQuery,
  useRequestDraftUploadSlotMutation,
  useQuoteExtraRevisionMutation,
} = dealDraftsApi;
