import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi, IDEMPOTENCY_HEADER, normalizeApiError } from '@/core/api';
import { env } from '@/core/config';
import i18n from '@/core/i18n';
import { TOP_UPS_PER_PAGE } from '../constants/topUp';
import type {
  CreateTopUpArgs,
  ExchangeRateDto,
  TopUp,
  TopUpChannels,
  TopUpChannelsDto,
  TopUpDto,
  TopUpFilters,
  TopUpsPage,
  TopUpsPageDto,
} from '../types';
import { buildFallbackChannels, mapTopUp, mapTopUpChannels, mapTopUpsPage } from '../utils/topUpMappers';
import { mapExchangeRate } from '../utils/walletMappers';

const NOT_FOUND = 404;

/** A response the app can't read (odd currency): fails like any other request. */
const unreadable = (reason: unknown): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: reason instanceof Error ? reason.message : 'Unreadable response',
});

/** Brand top-ups (handoff §6 + `docs/mobile-handoff-topup-v2.md`). */
export const topUpApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * Channels, Sada's receiving accounts, limits and the rate in one call. A 404 means
     * the server predates the endpoint: the app builds the channels itself from the
     * handoff rules and today's rate (`buildFallbackChannels`).
     */
    getTopUpChannels: builder.query<TopUpChannels, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        // Accounts and pause state change from the admin panel: never an HTTP-cached copy.
        const result = await baseQuery({
          url: '/wallet/top-ups/channels',
          headers: { 'Cache-Control': 'no-store' },
        });
        if (!result.error) {
          try {
            return { data: mapTopUpChannels(result.data as TopUpChannelsDto) };
          } catch (err) {
            return { error: unreadable(err) };
          }
        }
        if (normalizeApiError(result.error).statusCode !== NOT_FOUND) return { error: result.error };

        const rateResult = await baseQuery({ url: '/finance/exchange-rate' });
        if (rateResult.error) return { error: rateResult.error };
        try {
          const rate = mapExchangeRate(rateResult.data as ExchangeRateDto | null);
          return { data: buildFallbackChannels(rate, key => i18n.t(key), env.ENABLE_MOCK_DATA) };
        } catch (err) {
          return { error: unreadable(err) };
        }
      },
      // Always fresh when the flow opens (top-ups v2 §1).
      keepUnusedDataFor: 0,
    }),
    /** Multipart with the intent's `Idempotency-Key` (rule 06, handoff §3). */
    createTopUp: builder.mutation<TopUp, CreateTopUpArgs>({
      query: ({ body, idempotencyKey }) => ({
        url: '/wallet/top-ups',
        method: 'POST',
        body,
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      transformResponse: (dto: TopUpDto) => mapTopUp(dto),
      // Dev mock mode completes at once: the balance and the statement move too.
      invalidatesTags: [
        'Wallet',
        { type: 'WalletTransaction', id: 'LIST' },
        { type: 'TopUp', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(topUpApi.util.upsertQueryData('getTopUp', data.id, data));
        } catch {
          // The wizard reports the failure.
        }
      },
    }),
    /** History, newest first; the status filter is the cache key. */
    getTopUps: builder.infiniteQuery<TopUpsPage, TopUpFilters, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/wallet/top-ups',
        params: { ...queryArg, page: pageParam, per_page: TOP_UPS_PER_PAGE },
      }),
      transformResponse: (dto: TopUpsPageDto) => mapTopUpsPage(dto),
      providesTags: [{ type: 'TopUp', id: 'LIST' }],
    }),
    getTopUp: builder.query<TopUp, string>({
      query: id => `/wallet/top-ups/${encodeURIComponent(id)}`,
      transformResponse: (dto: TopUpDto) => mapTopUp(dto),
      providesTags: (_result, _error, id) => [{ type: 'TopUp', id }],
    }),
  }),
});

export const {
  useGetTopUpChannelsQuery,
  useCreateTopUpMutation,
  useGetTopUpsInfiniteQuery,
  useGetTopUpQuery,
} = topUpApi;
