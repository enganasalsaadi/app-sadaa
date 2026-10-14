import { baseApi } from '@/core/api';
import { mapUploadSlot, type UploadSlot, type UploadSlotDto, type UploadSlotRequest } from '@/core/upload';
import type { Deal, DealFile } from '../types/deal';
import type { DealDto, DealFileDto } from '../types/dealDto';
import type { DealOfferInput, DealOfferPreflight, DealPreflightArgs, DealQuote, DealQuoteArgs } from '../types/dealOffer';
import type { DealOfferPreflightDto, DealQuoteDto } from '../types/dealOfferDto';
import { mapDeal, mapDealFile } from '../utils/dealMappers';
import { mapDealOfferPreflight, mapDealQuote, toDealOfferBody, toPreflightParams } from '../utils/dealOfferMappers';
import { dealsApi } from './dealsApi';

const BRAND_DEALS = '/brand/deals';
const draftUrl = (id: string, sub?: string) =>
  `${BRAND_DEALS}/${encodeURIComponent(id)}${sub ? `/${sub}` : ''}`;

interface DraftAttachmentArgs {
  dealId: string;
  fileId: string;
}

/**
 * The brand's offer builder (handoff M2 + preflight): blockers before it opens, a live quote,
 * the server draft (autosaved) and its brief attachments. Sending goes through `runDealAction`
 * (`send` answers the full deal).
 */
export const dealOfferApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** No KYC needed: the answer itself says `kyc_required`. Fresh on every builder open. */
    getDealOfferPreflight: builder.query<DealOfferPreflight, DealPreflightArgs>({
      query: args => ({ url: `${BRAND_DEALS}/preflight`, params: toPreflightParams(args) }),
      transformResponse: (dto: DealOfferPreflightDto) => mapDealOfferPreflight(dto),
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'DealList', id: 'LIST' }],
    }),
    /** A preview, never saved: the args are the cache key, so stepping back reuses the last price. */
    quoteDealOffer: builder.query<DealQuote, DealQuoteArgs>({
      query: ({ creatorSlug, offer }) => ({
        url: `${BRAND_DEALS}/quote`,
        method: 'POST',
        body: { creator_slug: creatorSlug, ...toDealOfferBody(offer) },
      }),
      transformResponse: (dto: DealQuoteDto) => mapDealQuote(dto),
      keepUnusedDataFor: 30,
    }),
    createDealOfferDraft: builder.mutation<Deal, DealQuoteArgs>({
      query: ({ creatorSlug, offer }) => ({
        url: BRAND_DEALS,
        method: 'POST',
        body: { creator_slug: creatorSlug, ...toDealOfferBody(offer) },
      }),
      transformResponse: (dto: DealDto) => mapDeal(dto),
      invalidatesTags: [{ type: 'DealList', id: 'LIST' }],
    }),
    /** Replaces the whole draft (the creator can't change). The cached detail follows the answer. */
    updateDealOfferDraft: builder.mutation<Deal, { id: string; offer: DealOfferInput }>({
      query: ({ id, offer }) => ({ url: draftUrl(id), method: 'PUT', body: toDealOfferBody(offer) }),
      transformResponse: (dto: DealDto) => mapDeal(dto),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(dealsApi.util.upsertQueryData('getDeal', { role: 'brand', id }, { deal: data, funding: null }));
        } catch {
          // The autosave reports its own failure.
        }
      },
      invalidatesTags: [{ type: 'DealList', id: 'LIST' }],
    }),
    deleteDealOfferDraft: builder.mutation<null, string>({
      query: id => ({ url: draftUrl(id), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DealList', id: 'LIST' },
        { type: 'Deal', id },
      ],
    }),
    requestBriefAttachmentSlot: builder.mutation<UploadSlot, { dealId: string; request: UploadSlotRequest }>({
      query: ({ dealId, request }) => ({ url: draftUrl(dealId, 'attachments'), method: 'POST', body: request }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** After the PUT: the file joins the draft's brief (and its contract at send). */
    completeBriefAttachment: builder.mutation<DealFile, DraftAttachmentArgs>({
      query: ({ dealId, fileId }) => ({
        url: draftUrl(dealId, `attachments/${encodeURIComponent(fileId)}/complete`),
        method: 'POST',
      }),
      transformResponse: (dto: DealFileDto) => mapDealFile(dto),
      invalidatesTags: (_result, _error, { dealId }) => [{ type: 'Deal', id: dealId }],
    }),
    removeBriefAttachment: builder.mutation<null, DraftAttachmentArgs>({
      query: ({ dealId, fileId }) => ({
        url: draftUrl(dealId, `attachments/${encodeURIComponent(fileId)}`),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { dealId }) => [{ type: 'Deal', id: dealId }],
    }),
  }),
});

export const {
  useGetDealOfferPreflightQuery,
  useQuoteDealOfferQuery,
  useCreateDealOfferDraftMutation,
  useUpdateDealOfferDraftMutation,
  useDeleteDealOfferDraftMutation,
  useRequestBriefAttachmentSlotMutation,
  useCompleteBriefAttachmentMutation,
  useRemoveBriefAttachmentMutation,
} = dealOfferApi;
