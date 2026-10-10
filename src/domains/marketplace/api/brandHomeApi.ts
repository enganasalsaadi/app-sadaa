import { baseApi } from '@/core/api';
import type { BrandHome, BrandHomeDto } from '../types/explore';
import { mapBrandHome } from '../utils/exploreMappers';

export const brandHomeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Handoff §5. Each call records rail impressions (throttle 30/min): fetch on mount / pull / stale focus only. */
    getBrandHome: builder.query<BrandHome, void>({
      query: () => '/brand/home',
      transformResponse: (dto: BrandHomeDto) => mapBrandHome(dto),
      keepUnusedDataFor: 300,
      providesTags: ['BrandHome'],
    }),
  }),
});

export const { useGetBrandHomeQuery } = brandHomeApi;
