import { baseApi } from '@/core/api';
import { mapUploadSlot, type UploadSlot, type UploadSlotDto, type UploadSlotRequest } from '@/core/upload';
import type { DealItemRef, DealPublication } from '../types/deal';
import type { DealPublicationDto } from '../types/dealDto';
import { mapDealPublication } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';

const itemPath = (itemId: string, action: string) => `items/${itemId}/${action}`;

/**
 * Publishing and verifying (handoff M7). Publishing, verifying and asking for a fix answer the
 * full deal, so they go through `runDealAction`; its success invalidates `DealHistory`, which
 * refetches the submissions here as well as the timeline.
 */
export const dealPublishApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Every live-link submission of one deliverable with the brand's answer, newest first. */
    getDealItemPublications: builder.query<DealPublication[], DealItemRef>({
      query: ({ itemId, ...ref }) => buildDealUrl(ref, itemPath(itemId, 'publications')),
      transformResponse: (dtos: DealPublicationDto[]) => dtos.map(mapDealPublication),
      providesTags: (_result, _error, { id }) => [{ type: 'DealHistory', id }],
    }),
    /** Creator: a signed slot for one proof screenshot (step 1 of 3). */
    requestProofUploadSlot: builder.mutation<
      UploadSlot,
      { dealId: string; itemId: string; request: UploadSlotRequest }
    >({
      query: ({ dealId, itemId, request }) => ({
        url: buildDealUrl({ role: 'creator', id: dealId }, itemPath(itemId, 'proof-uploads')),
        method: 'POST',
        body: request,
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
  }),
});

export const { useGetDealItemPublicationsQuery, useRequestProofUploadSlotMutation } = dealPublishApi;
