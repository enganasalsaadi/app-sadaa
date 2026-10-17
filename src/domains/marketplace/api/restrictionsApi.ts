import { baseApi } from '@/core/api';
import type { CreatorRestrictions } from '../types/restriction';
import type { CreatorRestrictionDto, CreatorRestrictionsMetaDto } from '../types/restrictionDto';
import { mapCreatorRestrictions } from '../utils/restrictions';

export const restrictionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * Creator only (contract §5.5): what holds the creator back and the two verdicts the app obeys
     * (`can_apply_public`, `can_accept_direct`). Stale after any deal action, a `deal_return_*` push
     * and a `403 creator_restricted`.
     */
    getCreatorRestrictions: builder.query<CreatorRestrictions, void>({
      query: () => '/influencer/restrictions',
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: { data: CreatorRestrictionDto[]; meta: CreatorRestrictionsMetaDto }) =>
        mapCreatorRestrictions(data, meta),
      keepUnusedDataFor: 300,
      providesTags: ['CreatorRestrictions'],
    }),
  }),
});

export const { useGetCreatorRestrictionsQuery } = restrictionsApi;
