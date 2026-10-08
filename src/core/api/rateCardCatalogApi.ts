import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getValidLanguage } from '@/core/i18n';
import { appStorage, StorageKeys } from '@/core/storage';
import { baseApi } from './baseApi';
import { readCatalogCache, writeCatalogCache } from './rateCardCatalogCache';
import type { RateCardCatalog } from './rateCardCatalogTypes';

const HTTP_NOT_MODIFIED = 304;

const EMPTY_CATALOG_ERROR: FetchBaseQueryError = {
  status: 'CUSTOM_ERROR',
  error: 'Empty rate card catalog',
};

export const rateCardCatalogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * Public, localized, ETag-versioned (handoff §3). The last copy per language
     * lives in MMKV: `If-None-Match` turns an unchanged catalog into a body-less
     * 304, and offline the cached copy still renders the editor.
     */
    getRateCardCatalog: builder.query<RateCardCatalog, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const language = getValidLanguage(appStorage.get(StorageKeys.LANGUAGE));
        const cached = readCatalogCache(language);
        const received: { etag: string | null } = { etag: null };

        const result = await baseQuery({
          url: '/lookups/rate-card-catalog',
          headers: cached?.etag ? { 'If-None-Match': cached.etag } : undefined,
          validateStatus: response => response.ok || response.status === HTTP_NOT_MODIFIED,
          responseHandler: async response => {
            received.etag = response.headers.get('ETag');
            return response.status === HTTP_NOT_MODIFIED ? null : response.json();
          },
        });

        if (result.error) return cached ? { data: cached.catalog } : { error: result.error };
        if (result.data == null) {
          return cached ? { data: cached.catalog } : { error: EMPTY_CATALOG_ERROR };
        }
        // Trust boundary: the envelope's `data` is the catalog (contract §1).
        const catalog = result.data as RateCardCatalog;
        writeCatalogCache(language, { etag: received.etag, catalog });
        return { data: catalog };
      },
      // Reference data: one revalidation per session is enough.
      keepUnusedDataFor: 60 * 60,
    }),
  }),
});

export const { useGetRateCardCatalogQuery } = rateCardCatalogApi;
