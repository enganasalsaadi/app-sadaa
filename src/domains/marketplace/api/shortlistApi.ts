import { baseApi } from '@/core/api';
import type { ExploreCreatorsPage, ExploreCreatorsPageDto, SetShortlistedArgs } from '../types/explore';
import { mapExploreCreatorsPage } from '../utils/exploreMappers';
import { setShortlistedIn } from '../utils/shortlistCache';
import { brandHomeApi } from './brandHomeApi';
import { exploreApi } from './exploreApi';

export const SHORTLIST_PER_PAGE = 20;

// List first, so the toggle below can patch it with typed `util`.
const shortlistListApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Handoff §5: cursor pages; ineligible creators are hidden server-side. */
    getShortlist: builder.infiniteQuery<ExploreCreatorsPage, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({
        url: '/brand/shortlist',
        params: { per_page: SHORTLIST_PER_PAGE, ...(pageParam ? { cursor: pageParam } : {}) },
      }),
      extraOptions: { withMeta: true },
      transformResponse: (dto: ExploreCreatorsPageDto) => mapExploreCreatorsPage(dto),
      providesTags: [{ type: 'Shortlist', id: 'LIST' }],
    }),
  }),
});

export const shortlistApi = shortlistListApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * PUT/DELETE, both idempotent (204). ❤️ flips at once on every cached Explore page, Home rail
     * and Shortlist page, and rolls back on failure (`404` ineligible, `409 shortlist_full`).
     * A removal leaves the Shortlist list at once; an add refetches it (server order).
     */
    setShortlisted: builder.mutation<void, SetShortlistedArgs>({
      query: ({ card, shortlisted }) => ({
        url: `/brand/shortlist/${encodeURIComponent(card.slug)}`,
        method: shortlisted ? 'PUT' : 'DELETE',
      }),
      async onQueryStarted({ card, shortlisted }, { dispatch, getState, queryFulfilled }) {
        const { slug } = card;
        const state = getState();
        const patches = [
          ...exploreApi.util
            .selectCachedArgsForQuery(state, 'getExploreCreators')
            .map(args =>
              dispatch(
                exploreApi.util.updateQueryData('getExploreCreators', args, draft => {
                  draft.pages.forEach(page => setShortlistedIn(page.items, slug, shortlisted));
                }),
              ),
            ),
          dispatch(
            brandHomeApi.util.updateQueryData('getBrandHome', undefined, draft => {
              draft.rails.forEach(rail => setShortlistedIn(rail.items, slug, shortlisted));
            }),
          ),
        ];
        if (!shortlisted) {
          patches.push(
            dispatch(
              shortlistListApi.util.updateQueryData('getShortlist', undefined, draft => {
                draft.pages.forEach(page => {
                  page.items = page.items.filter(item => item.slug !== slug);
                });
              }),
            ),
          );
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
      invalidatesTags: (_result, error, { shortlisted }) =>
        shortlisted && !error ? [{ type: 'Shortlist', id: 'LIST' }] : [],
    }),
  }),
});

export const { useGetShortlistInfiniteQuery, useSetShortlistedMutation } = shortlistApi;
