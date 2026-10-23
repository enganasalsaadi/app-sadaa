import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from '@/core/api';
import type { DealRef } from '../types/deal';
import type { DealDisputeDto, DealDraftDto, DealDto, DealPublicationDto } from '../types/dealDto';
import { mapDeal, mapDealDisputeDetail, mapDealDraft, mapDealPublication } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import { vaultDraftItems, vaultPublishItems, type DealVaultSource } from '../utils/dealVault';

const unreadable = (reason: unknown): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: reason instanceof Error ? reason.message : 'Unreadable response',
});

/**
 * The deal vault (every file on one deal), read from the routes that already carry them: the deal,
 * each item's rounds and publications, the dispute thread. Only items that can have files are
 * asked; any failed read fails the vault, so it never shows a partial list as complete.
 */
export const dealFilesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getDealFiles: builder.query<DealVaultSource, DealRef>({
      async queryFn(ref, _api, _extraOptions, baseQuery) {
        const head = await baseQuery(buildDealUrl(ref));
        if (head.error) return { error: head.error };
        try {
          const deal = mapDeal(head.data as DealDto);
          const reads = await Promise.all([
            ...vaultDraftItems(deal).map(item => baseQuery(buildDealUrl(ref, `items/${item.id}/drafts`))),
            ...vaultPublishItems(deal).map(item => baseQuery(buildDealUrl(ref, `items/${item.id}/publications`))),
            ...(deal.dispute ? [baseQuery(buildDealUrl(ref, 'disputes'))] : []),
          ]);
          const failed = reads.find(read => read.error);
          if (failed?.error) return { error: failed.error };

          const draftCount = vaultDraftItems(deal).length;
          const publishCount = vaultPublishItems(deal).length;
          const drafts = reads
            .slice(0, draftCount)
            .flatMap(read => (read.data as DealDraftDto[]).map(mapDealDraft));
          const publications = reads
            .slice(draftCount, draftCount + publishCount)
            .flatMap(read => (read.data as DealPublicationDto[]).map(mapDealPublication));
          const disputes = reads
            .slice(draftCount + publishCount)
            .flatMap(read => (read.data as DealDisputeDto[]).map(mapDealDisputeDetail));
          return { data: { deal, drafts, publications, disputes } };
        } catch (err) {
          return { error: unreadable(err) };
        }
      },
      providesTags: (_result, _error, { id }) => [
        { type: 'Deal', id },
        { type: 'DealHistory', id },
      ],
    }),
  }),
});

export const { useGetDealFilesQuery } = dealFilesApi;
