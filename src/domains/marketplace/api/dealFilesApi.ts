import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from '@/core/api';
import type { DealRef } from '../types/deal';
import type { DealDto, DealVaultFilesDto } from '../types/dealDto';
import { mapDeal, mapDealVaultFile } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';
import type { DealVaultSource } from '../utils/dealVault';

/**
 * Signed links on a vault read stay fresh this long: the vault re-reads when opened on an older
 * read, and a burst of expired-link refreshes shares one read inside the window.
 */
export const DEAL_FILES_FRESH_SECONDS = 60;

const unreadable = (reason: unknown): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: reason instanceof Error ? reason.message : 'Unreadable response',
});

/**
 * The deal vault (every file on one deal): the deal's file list, signed afresh on every read, next
 * to the deal itself (titles, brief lock, courier photos, retention screenshots), both at once.
 * Either failing fails the vault, so it never shows a partial list as complete. Silent: the deal
 * page shows the vault as a side strip, so its failures never raise the global error UI.
 */
export const dealFilesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getDealFiles: builder.query<DealVaultSource, DealRef>({
      async queryFn(ref, _api, _extraOptions, baseQuery) {
        const [head, list] = await Promise.all([baseQuery(buildDealUrl(ref)), baseQuery(buildDealUrl(ref, 'files'))]);
        if (head.error) return { error: head.error };
        if (list.error) return { error: list.error };
        try {
          const deal = mapDeal(head.data as DealDto);
          const files = (list.data as DealVaultFilesDto).items.map(mapDealVaultFile);
          return { data: { deal, files } };
        } catch (err) {
          return { error: unreadable(err) };
        }
      },
      extraOptions: { silent: true },
      providesTags: (_result, _error, { id }) => [
        { type: 'Deal', id },
        { type: 'DealHistory', id },
      ],
    }),
  }),
});

export const { useGetDealFilesQuery } = dealFilesApi;
