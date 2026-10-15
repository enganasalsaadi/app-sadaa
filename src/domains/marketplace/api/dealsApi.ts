import { baseApi, IDEMPOTENCY_HEADER, normalizeApiError } from '@/core/api';
import type { PushTarget } from '@/core/notification';
import type {
  DealActionArgs,
  DealActionResult,
  DealContract,
  DealDetail,
  DealListArgs,
  DealRef,
  DealsPage,
  DealTimelineRow,
} from '../types/deal';
import type {
  DealActionMetaDto,
  DealContractDto,
  DealDto,
  DealsPageDto,
  DealTimelineRowDto,
} from '../types/dealDto';
import {
  mapDealActionResult,
  mapDealContract,
  mapDealDetail,
  mapDealsPage,
  mapDealTimelineRow,
} from '../utils/dealMappers';
import { buildDealUrl, buildDealsListUrl } from '../utils/dealQuery';
import { isDealConflictError } from '../utils/dealAction';

/** A `withMeta` deal response: the deal in `data`, action extras in `meta`. */
interface DealEnvelopeDto {
  data: DealDto;
  meta: DealActionMetaDto;
}

/**
 * What else moves when a deal does: the lists (status changes tab), its history (new rows,
 * addenda), the brand home's active deals, the escrow money and the creator's strikes (a
 * withdrawal records one). Each refetches only if on screen.
 */
export const dealChangedTags = (id: string) =>
  [
    { type: 'DealList', id: 'LIST' },
    { type: 'DealHistory', id },
    'BrandHome',
    'Wallet',
    'WalletEscrow',
    'WalletEarnings',
    { type: 'WalletTransaction', id: 'LIST' },
    'DealStrikes',
  ] as const;

/**
 * A `deal_*` push only says the deal moved (M11): refetch it and everything that moves with it.
 * The kind is open-ended (`deal_<kind>`), so the link alone decides; `sada://strikes` (a strike
 * cleared) refetches the strikes list only.
 */
export const dealPushTags = (target: PushTarget | null) => {
  if (target?.kind === 'deal') {
    return [{ type: 'Deal', id: target.dealId }, ...dealChangedTags(target.dealId)] as const;
  }
  return target?.kind === 'strikes' ? (['DealStrikes'] as const) : [];
};

/** Direct Deals reads + every action answering the full deal (handoff §0, M3). Both roles. */
export const dealsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Newest activity first; role + statuses are the cache key, so each tab keeps its pages. */
    getDeals: builder.infiniteQuery<DealsPage, DealListArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.currentPage < meta.lastPage ? meta.currentPage + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => buildDealsListUrl(queryArg, pageParam),
      transformResponse: (dto: DealsPageDto) => mapDealsPage(dto),
      providesTags: [{ type: 'DealList', id: 'LIST' }],
    }),
    getDeal: builder.query<DealDetail, DealRef>({
      query: ref => buildDealUrl(ref),
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: DealEnvelopeDto) => mapDealDetail(data, meta),
      providesTags: (_result, _error, { id }) => [{ type: 'Deal', id }],
    }),
    /** Status changes + note rows (`isNote`), oldest first. */
    getDealTimeline: builder.query<DealTimelineRow[], DealRef>({
      query: ref => buildDealUrl(ref, 'timeline'),
      transformResponse: (rows: DealTimelineRowDto[]) => rows.map(mapDealTimelineRow),
      providesTags: (_result, _error, { id }) => [{ type: 'DealHistory', id }],
    }),
    /** Bilingual snapshot + addenda; the Arabic text governs. */
    getDealContract: builder.query<DealContract, DealRef>({
      query: ref => buildDealUrl(ref, 'contract'),
      transformResponse: (dto: DealContractDto) => mapDealContract(dto),
      providesTags: (_result, _error, { id }) => [{ type: 'DealHistory', id }],
    }),
    /**
     * Any action answering the full deal. Success replaces the cached detail with `data` (no
     * refetch); a `deal_*` conflict (409, or 403 on disputes) refetches it, since the deal moved
     * under the user. Go through `useDealAction`, which adds the toast and idempotency.
     */
    runDealAction: builder.mutation<DealActionResult, DealActionArgs>({
      query: ({ ref, path, method = 'POST', body, idempotencyKey }) => ({
        url: buildDealUrl(ref, path),
        method,
        body: body ?? {},
        ...(idempotencyKey ? { headers: { [IDEMPOTENCY_HEADER]: idempotencyKey } } : {}),
      }),
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: DealEnvelopeDto) => mapDealActionResult(data, meta),
      async onQueryStarted({ ref }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            dealsApi.util.upsertQueryData('getDeal', ref, {
              deal: data.deal,
              funding: data.funding,
            }),
          );
        } catch {
          // The caller reports the failure; a conflict refetches through the tags below.
        }
      },
      invalidatesTags: (_result, error, { ref }) => {
        if (!error) return [...dealChangedTags(ref.id)];
        return isDealConflictError(normalizeApiError(error))
          ? [{ type: 'Deal', id: ref.id }, ...dealChangedTags(ref.id)]
          : [];
      },
    }),
  }),
});

export const {
  useGetDealsInfiniteQuery,
  useGetDealQuery,
  useGetDealTimelineQuery,
  useGetDealContractQuery,
  useRunDealActionMutation,
} = dealsApi;
