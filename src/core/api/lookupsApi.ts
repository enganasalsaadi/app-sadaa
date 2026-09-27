import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { baseApi } from './baseApi';

export interface LookupOption {
  id: string;
  name_ar: string;
  name_en: string;
}

export interface FollowerTier {
  label_ar: string;
  label_en: string;
  range: string;
  min: number;
  max: number | null;
}

/** Public reference data (GET /lookups) — server-localized, rendered as-is (rule 03). */
export interface LookupsResponse {
  governorates: LookupOption[];
  business_types: LookupOption[];
  niches: LookupOption[];
  social_platforms: LookupOption[];
  service_types: LookupOption[];
  follower_tiers: Record<string, FollowerTier>;
}

export type LookupListKey = {
  [K in keyof LookupsResponse]: LookupsResponse[K] extends LookupOption[]
    ? K
    : never;
}[keyof LookupsResponse];

/** `{ value, label }` in the active language — what selection controls consume. */
export interface LookupItem {
  value: string;
  label: string;
}

export const lookupsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getLookups: builder.query<LookupsResponse, void>({
      query: () => '/lookups',
      providesTags: ['Lookups'],
      // Reference data barely changes; keep it for the session.
      keepUnusedDataFor: 60 * 60,
    }),
  }),
});

export const { useGetLookupsQuery } = lookupsApi;

export const toLookupItems = (
  options: readonly LookupOption[] | undefined,
  language: string,
): LookupItem[] =>
  (options ?? []).map(option => ({
    value: option.id,
    label: language.startsWith('ar') ? option.name_ar : option.name_en,
  }));

/** One lookup list, localized and memoised; shares the single /lookups request. */
export const useLookupItems = (key: LookupListKey) => {
  const { i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useGetLookupsQuery();
  const options = data?.[key];

  const items = useMemo(
    () => toLookupItems(options, i18n.language),
    [options, i18n.language],
  );

  return { items, isLoading, isError, refetch };
};
