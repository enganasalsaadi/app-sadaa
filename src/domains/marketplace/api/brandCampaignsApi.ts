import { baseApi, IDEMPOTENCY_HEADER, normalizeApiError } from '@/core/api';
import { mapUploadSlot } from '@/core/upload';
import type { UploadSlot, UploadSlotDto, UploadSlotRequest } from '@/core/upload';
import type {
  ApplicantArgs,
  ApplicantCard,
  ApplicantDecisionArgs,
  ApplicantSelectArgs,
  ApplicantsArgs,
  ApplicantsCompareArgs,
  ApplicantsPage,
  CampaignActionArgs,
  CampaignActionResult,
  CampaignDetail,
  CampaignFile,
  CampaignFilePurpose,
  CampaignHistoryRow,
  CampaignListArgs,
  CampaignPage,
  CampaignQuote,
  CampaignSelectResult,
  Campaign,
} from '../types/campaign';
import type {
  ApplicantCardDto,
  ApplicantsPageDto,
  CampaignActionDataDto,
  CampaignActionMetaDto,
  CampaignDetailDto,
  CampaignDto,
  CampaignFileDto,
  CampaignHistoryRowDto,
  CampaignPageDto,
  CampaignQuoteDto,
  CampaignSelectDto,
} from '../types/campaignDto';
import type { CampaignDraftRequest } from '../types/campaignDraft';
import { isCampaignConflictError } from '../utils/campaignAction';
import {
  mapApplicantCard,
  mapApplicantsPage,
  mapCampaignActionResult,
  mapCampaignDetail,
  mapCampaignSelectResult,
  mapCampaignFile,
  mapCampaignHistoryRow,
  mapCampaignQuote,
  mapCampaignsPage,
} from '../utils/campaignMappers';
import {
  BRAND_CAMPAIGNS_URL,
  buildBrandApplicantUrl,
  buildBrandApplicantsCompareUrl,
  buildBrandApplicantsUrl,
  buildBrandCampaignFilesUrl,
  buildBrandCampaignUrl,
  buildBrandCampaignsUrl,
} from '../utils/campaignQuery';

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

/** Draft keys the quote is worked out from: saving one of them makes the cached quote stale. */
const QUOTE_INPUTS = ['pricing_model', 'seats_total', 'deliverables'] as const;

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
    /**
     * One page set per tab + filters (the args are the key). The first page also carries the tab
     * badges (`counts`) and the recruiting summary, so a decision invalidates every set at once.
     */
    getCampaignApplicants: builder.infiniteQuery<ApplicantsPage, ApplicantsArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.currentPage < meta.lastPage ? meta.currentPage + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => buildBrandApplicantsUrl(queryArg, pageParam),
      transformResponse: (dto: ApplicantsPageDto) => mapApplicantsPage(dto),
      providesTags: (_result, _error, arg) => [{ type: 'CampaignApplicants', id: arg.id }],
    }),
    /** One applicant's card (the detail page): opened from a row, or by id once links reach it. */
    getCampaignApplicant: builder.query<ApplicantCard, ApplicantArgs>({
      query: args => buildBrandApplicantUrl(args),
      transformResponse: (dto: ApplicantCardDto) => mapApplicantCard(dto),
      providesTags: (_result, _error, { applicationId }) => [{ type: 'CampaignApplicant', id: applicationId }],
    }),
    /** 2–4 cards side by side (a plain array, in the server's order); any decision on the campaign makes it stale. */
    getCampaignApplicantsCompare: builder.query<ApplicantCard[], ApplicantsCompareArgs>({
      query: args => buildBrandApplicantsCompareUrl(args),
      transformResponse: (dtos: ApplicantCardDto[]) => dtos.map(mapApplicantCard),
      providesTags: (_result, _error, { id }) => [{ type: 'CampaignApplicants', id }],
    }),
    /**
     * Shortlist or reject (contract §3.5): the answer is the card, which replaces the cached one.
     * Every list refetches (counts and tabs moved) along with the campaign (a decision on a
     * suspended one reopens it). A 409 means the card moved under the brand (72h passed, seat
     * gone): it refetches too, and the screen shows the server's message.
     */
    decideCampaignApplicant: builder.mutation<ApplicantCard, ApplicantDecisionArgs>({
      query: ({ decision, ...args }) => ({ url: buildBrandApplicantUrl(args, decision), method: 'POST', body: {} }),
      transformResponse: (dto: ApplicantCardDto) => mapApplicantCard(dto),
      async onQueryStarted({ id, applicationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(brandCampaignsApi.util.upsertQueryData('getCampaignApplicant', { id, applicationId }, data));
        } catch {
          // The screen reports the failure; a conflict refetches through the tags below.
        }
      },
      invalidatesTags: (_result, error, { id, applicationId }) => {
        if (!error) return [{ type: 'CampaignApplicants', id }, { type: 'Campaign', id }, ...campaignChangedTags(id)];
        return isCampaignConflictError(normalizeApiError(error))
          ? [
              { type: 'CampaignApplicant', id: applicationId },
              { type: 'CampaignApplicants', id },
              { type: 'Campaign', id },
            ]
          : [];
      },
    }),
    /**
     * Selects an applicant (contract §3.5): the seat is taken and a deal is born from the card, held
     * in escrow when the wallet covers it, else waiting 24 h for payment. Binding, so it signs with
     * this device's id and an `Idempotency-Key` (rule 06). The card is replaced by the answer; the
     * lists, the campaign and the brand's deals refresh. Every refusal (409 `campaign_*`, 422 budget
     * or unavailable) means the card or the campaign moved, so those refetch too.
     */
    selectCampaignApplicant: builder.mutation<CampaignSelectResult, ApplicantSelectArgs>({
      query: ({ deviceId, idempotencyKey, ...args }) => ({
        url: buildBrandApplicantUrl(args, 'select'),
        method: 'POST',
        body: { device_id: deviceId },
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      transformResponse: (dto: CampaignSelectDto) => mapCampaignSelectResult(dto),
      async onQueryStarted({ id, applicationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(brandCampaignsApi.util.upsertQueryData('getCampaignApplicant', { id, applicationId }, data.application));
        } catch {
          // The caller reports the failure; a refusal refetches through the tags below.
        }
      },
      invalidatesTags: (_result, error, { id, applicationId }) => {
        if (!error) {
          return [
            { type: 'CampaignApplicants', id },
            { type: 'Campaign', id },
            { type: 'DealList', id: 'LIST' },
            'Wallet',
            ...campaignChangedTags(id),
          ];
        }
        const { statusCode } = normalizeApiError(error);
        return statusCode === 409 || statusCode === 422
          ? [
              { type: 'CampaignApplicant', id: applicationId },
              { type: 'CampaignApplicants', id },
              { type: 'Campaign', id },
            ]
          : [];
      },
    }),
    /** Status changes + note rows (`from.key == to.key`), a plain array. */
    getCampaignHistory: builder.query<CampaignHistoryRow[], string>({
      query: id => buildBrandCampaignUrl(id, 'history'),
      transformResponse: (rows: CampaignHistoryRowDto[]) => rows.map(mapCampaignHistoryRow),
      providesTags: (_result, _error, id) => [{ type: 'CampaignHistory', id }],
    }),
    /**
     * Pricing preview of the saved draft (contract §3.2 Quote): per-seat split, the most it could
     * hold, the wallet against it. A warning only; nothing is held. Stale after a pricing, seats or
     * deliverables save (see `updateCampaign`), so it follows the autosave's quiet time.
     */
    getCampaignQuote: builder.query<CampaignQuote, string>({
      query: id => buildBrandCampaignUrl(id, 'quote'),
      transformResponse: (dto: CampaignQuoteDto) => mapCampaignQuote(dto),
      providesTags: (_result, _error, id) => [{ type: 'CampaignQuote', id }],
    }),
    /** Starts a draft from the first part (the title); answers the full campaign, which seeds the cache. */
    createCampaign: builder.mutation<CampaignDetail, CampaignDraftRequest>({
      query: body => ({ url: BRAND_CAMPAIGNS_URL, method: 'POST', body }),
      transformResponse: (dto: CampaignDetailDto) => mapCampaignDetail(dto),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(brandCampaignsApi.util.upsertQueryData('getCampaign', data.id, data));
        } catch {
          // The draft engine classifies the failure (limit, validation, network).
        }
      },
      invalidatesTags: result =>
        result ? [{ type: 'CampaignList', id: 'LIST' }, 'BrandHome'] : [],
    }),
    /**
     * Autosave of one wizard part. Success replaces the cached campaign (its `missing[]` moves the
     * steps) without touching the list: the wizard sits above it, and leaving invalidates once.
     */
    updateCampaign: builder.mutation<CampaignDetail, { id: string; body: CampaignDraftRequest }>({
      query: ({ id, body }) => ({ url: buildBrandCampaignUrl(id), method: 'PUT', body }),
      transformResponse: (dto: CampaignDetailDto) => mapCampaignDetail(dto),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(brandCampaignsApi.util.upsertQueryData('getCampaign', data.id, data));
        } catch {
          // The draft engine classifies the failure.
        }
      },
      invalidatesTags: (_result, error, { id, body }) => {
        if (error) return isCampaignConflictError(normalizeApiError(error)) ? [{ type: 'Campaign', id }] : [];
        return QUOTE_INPUTS.some(key => key in body) ? [{ type: 'CampaignQuote', id }] : [];
      },
    }),
    /** Drafts only; a `campaign_not_draft` conflict refetches the campaign the screen thought was a draft. */
    deleteCampaign: builder.mutation<void, string>({
      query: id => ({ url: buildBrandCampaignUrl(id), method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, error, id) =>
        !error
          ? [...campaignChangedTags(id)]
          : isCampaignConflictError(normalizeApiError(error))
            ? [{ type: 'Campaign', id }, ...campaignChangedTags(id)]
            : [],
    }),
    /** Step 1 of an upload (contract §3.2 Files): the signed slot for one cover or brief file. */
    requestCampaignFileSlot: builder.mutation<
      UploadSlot,
      { id: string; purpose: CampaignFilePurpose; request: UploadSlotRequest }
    >({
      query: ({ id, purpose, request }) => ({
        url: buildBrandCampaignFilesUrl(id),
        method: 'POST',
        body: { purpose, ...request },
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** Step 3, after the PUT: the file joins the campaign (a new cover replaces the old one server-side). */
    completeCampaignFile: builder.mutation<CampaignFile, { id: string; fileId: string }>({
      query: ({ id, fileId }) => ({
        url: buildBrandCampaignFilesUrl(id, fileId, 'complete'),
        method: 'POST',
      }),
      transformResponse: (dto: CampaignFileDto) => mapCampaignFile(dto),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: file } = await queryFulfilled;
          dispatch(
            brandCampaignsApi.util.updateQueryData('getCampaign', id, campaign => {
              if (file.purpose === 'cover') campaign.cover = file;
              else if (file.purpose === 'brief' && !campaign.attachments.some(entry => entry.id === file.id)) {
                campaign.attachments.push(file);
              }
            }),
          );
        } catch {
          // The upload flow reports the failure.
        }
      },
    }),
    removeCampaignFile: builder.mutation<void, { id: string; fileId: string }>({
      query: ({ id, fileId }) => ({ url: buildBrandCampaignFilesUrl(id, fileId), method: 'DELETE' }),
      transformResponse: () => undefined,
      async onQueryStarted({ id, fileId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            brandCampaignsApi.util.updateQueryData('getCampaign', id, campaign => {
              if (campaign.cover?.id === fileId) campaign.cover = null;
              campaign.attachments = campaign.attachments.filter(entry => entry.id !== fileId);
            }),
          );
        } catch {
          // The caller restores what it hid.
        }
      },
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
  useGetCampaignApplicantsInfiniteQuery,
  useGetCampaignApplicantQuery,
  useGetCampaignApplicantsCompareQuery,
  useDecideCampaignApplicantMutation,
  useSelectCampaignApplicantMutation,
  useGetCampaignQuery,
  useGetCampaignHistoryQuery,
  useGetCampaignQuoteQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useRequestCampaignFileSlotMutation,
  useCompleteCampaignFileMutation,
  useRemoveCampaignFileMutation,
  useRunCampaignActionMutation,
} = brandCampaignsApi;
