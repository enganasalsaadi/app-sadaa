import { baseApi, normalizeApiError } from '@/core/api';
import {
  mapUploadSlot,
  type UploadSlot,
  type UploadSlotDto,
  type UploadSlotRequest,
} from '@/core/upload';
import type { DealRetentionCase } from '../types/deal';
import type { DealRetentionCaseDto } from '../types/dealDto';
import { isDealConflictError } from '../utils/dealAction';
import { mapDealRetentionCase } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import { dealChangedTags } from './dealsApi';

interface RetentionCaseArgs {
  dealId: string;
  caseId: string;
}

interface RetentionWriteArgs extends RetentionCaseArgs {
  body: Record<string, unknown>;
}

const brandDeal = (id: string) => ({ role: 'brand' as const, id });
const creatorDeal = (id: string) => ({ role: 'creator' as const, id });

/**
 * Every write moves the deal's `retention_cases` (and its history), so it refetches the deal; a
 * `deal_retention_*` conflict refetches the same way: the case moved under the user (a timer
 * escalated it, the window closed). Other failures change nothing.
 */
const retentionWriteTags = (error: unknown, id: string) =>
  error && !isDealConflictError(normalizeApiError(error))
    ? []
    : [{ type: 'Deal' as const, id }, ...dealChangedTags(id)];

/**
 * Post retention (handoff M9, B10) after `completed`. The brand reports a post that went down
 * inside its period and decides on the restore; the creator restores it or contests the report.
 * Every route answers the case, not the deal; the deal already carries every case, so no list query.
 */
export const dealRetentionApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Brand: a signed slot for one report screenshot (step 1 of 3). */
    requestRetentionReportSlot: builder.mutation<
      UploadSlot,
      { dealId: string; itemId: string; request: UploadSlotRequest }
    >({
      query: ({ dealId, itemId, request }) => ({
        url: buildDealUrl(
          brandDeal(dealId),
          `items/${itemId}/retention/uploads`,
        ),
        method: 'POST',
        body: request,
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** Brand: `{reason, note?, file_ids[1–3]}`; opens a case awaiting the creator. */
    reportDealRetention: builder.mutation<
      DealRetentionCase,
      { dealId: string; itemId: string; body: Record<string, unknown> }
    >({
      query: ({ dealId, itemId, body }) => ({
        url: buildDealUrl(brandDeal(dealId), `items/${itemId}/retention`),
        method: 'POST',
        body,
      }),
      transformResponse: (dto: DealRetentionCaseDto) =>
        mapDealRetentionCase(dto),
      invalidatesTags: (_result, error, { dealId }) =>
        retentionWriteTags(error, dealId),
    }),
    /** Brand: the restore holds; the case closes. */
    confirmDealRetention: builder.mutation<
      DealRetentionCase,
      RetentionCaseArgs
    >({
      query: ({ dealId, caseId }) => ({
        url: buildDealUrl(brandDeal(dealId), `retention/${caseId}/confirm`),
        method: 'POST',
      }),
      transformResponse: (dto: DealRetentionCaseDto) =>
        mapDealRetentionCase(dto),
      invalidatesTags: (_result, error, { dealId }) =>
        retentionWriteTags(error, dealId),
    }),
    /** Brand: `{note}`; the restore isn't enough, the team decides. */
    rejectDealRetention: builder.mutation<
      DealRetentionCase,
      RetentionWriteArgs
    >({
      query: ({ dealId, caseId, body }) => ({
        url: buildDealUrl(brandDeal(dealId), `retention/${caseId}/reject`),
        method: 'POST',
        body,
      }),
      transformResponse: (dto: DealRetentionCaseDto) =>
        mapDealRetentionCase(dto),
      invalidatesTags: (_result, error, { dealId }) =>
        retentionWriteTags(error, dealId),
    }),
    /** Creator: a signed slot for one restore screenshot. */
    requestRetentionRestoreSlot: builder.mutation<
      UploadSlot,
      RetentionCaseArgs & { request: UploadSlotRequest }
    >({
      query: ({ dealId, caseId, request }) => ({
        url: buildDealUrl(creatorDeal(dealId), `retention/${caseId}/uploads`),
        method: 'POST',
        body: request,
      }),
      transformResponse: (dto: UploadSlotDto) => mapUploadSlot(dto),
    }),
    /** Creator: `{url?, file_ids[1–3]}`; the brand has a day to confirm. */
    restoreDealRetention: builder.mutation<
      DealRetentionCase,
      RetentionWriteArgs
    >({
      query: ({ dealId, caseId, body }) => ({
        url: buildDealUrl(creatorDeal(dealId), `retention/${caseId}/restore`),
        method: 'POST',
        body,
      }),
      transformResponse: (dto: DealRetentionCaseDto) =>
        mapDealRetentionCase(dto),
      invalidatesTags: (_result, error, { dealId }) =>
        retentionWriteTags(error, dealId),
    }),
    /** Creator: `{note}`; the report goes to the team. */
    contestDealRetention: builder.mutation<
      DealRetentionCase,
      RetentionWriteArgs
    >({
      query: ({ dealId, caseId, body }) => ({
        url: buildDealUrl(creatorDeal(dealId), `retention/${caseId}/contest`),
        method: 'POST',
        body,
      }),
      transformResponse: (dto: DealRetentionCaseDto) =>
        mapDealRetentionCase(dto),
      invalidatesTags: (_result, error, { dealId }) =>
        retentionWriteTags(error, dealId),
    }),
  }),
});

export const {
  useRequestRetentionReportSlotMutation,
  useReportDealRetentionMutation,
  useConfirmDealRetentionMutation,
  useRejectDealRetentionMutation,
  useRequestRetentionRestoreSlotMutation,
  useRestoreDealRetentionMutation,
  useContestDealRetentionMutation,
} = dealRetentionApi;
