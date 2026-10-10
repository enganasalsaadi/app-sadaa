import { baseApi } from '@/core/api';
import type {
  ExploreCreatorsPageDto,
  ExploreFilterOptions,
  ExploreFilters,
  ExploreFiltersDto,
  ExplorePage,
} from '../types/explore';
import { mapExploreFilters, mapExplorePage } from '../utils/exploreMappers';
import { buildExploreQuery } from '../utils/exploreQuery';

export const EXPLORE_PER_PAGE = 20;

export const exploreApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Handoff §3: cursor pages, no totals. Throttle 60/min. Locked 🔒 param → 403 `gated_parameter`. */
    getExploreCreators: builder.infiniteQuery<ExplorePage, ExploreFilters, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg, pageParam }) =>
        `/explore/creators?${buildExploreQuery(queryArg, pageParam, EXPLORE_PER_PAGE)}`,
      extraOptions: { withMeta: true },
      transformResponse: (dto: ExploreCreatorsPageDto) => mapExplorePage(dto),
      providesTags: [{ type: 'ExploreCreators', id: 'LIST' }],
    }),
    /** Handoff §4: server caches 1 h, so the client keeps it as long. */
    getExploreFilters: builder.query<ExploreFilterOptions, void>({
      query: () => '/explore/filters',
      transformResponse: (dto: ExploreFiltersDto) => mapExploreFilters(dto),
      keepUnusedDataFor: 3600,
      providesTags: ['ExploreFilters'],
    }),
  }),
});

export const { useGetExploreCreatorsInfiniteQuery, useGetExploreFiltersQuery } = exploreApi;
