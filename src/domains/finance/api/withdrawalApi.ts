import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import { WITHDRAWALS_PER_PAGE } from '../constants/withdraw';
import type {
  CancelWithdrawalArgs,
  CreateWithdrawalArgs,
  Withdrawal,
  WithdrawalDto,
  WithdrawalFilters,
  WithdrawalQuote,
  WithdrawalQuoteDto,
  WithdrawalRequestBody,
  WithdrawalsPage,
  WithdrawalsPageDto,
} from '../types';
import { mapWithdrawal, mapWithdrawalQuote, mapWithdrawalsPage } from '../utils/withdrawalMappers';

/** The wallet, its statement and the history all move when a withdrawal does. */
const MONEY_MOVED = [
  'Wallet',
  { type: 'WalletTransaction', id: 'LIST' },
  { type: 'Withdrawal', id: 'LIST' },
] as const;

/** Creator withdrawals (handoff §8). */
export const withdrawalApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /**
     * Live quote while the amount is typed. Silent: a 422 on a half-typed amount must not
     * toast; the amount step shows its own error and retry.
     */
    getWithdrawalQuote: builder.query<WithdrawalQuote, WithdrawalRequestBody>({
      query: params => ({ url: '/wallet/withdrawals/quote', params }),
      extraOptions: { silent: true },
      transformResponse: (dto: WithdrawalQuoteDto) => mapWithdrawalQuote(dto),
      // Limits, cooldown and the rate move server side: a quote is only good while on screen.
      keepUnusedDataFor: 0,
    }),
    /** The intent's `Idempotency-Key` (rule 06, handoff §3). */
    createWithdrawal: builder.mutation<Withdrawal, CreateWithdrawalArgs>({
      query: ({ body, idempotencyKey }) => ({
        url: '/wallet/withdrawals',
        method: 'POST',
        body,
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      transformResponse: (dto: WithdrawalDto) => mapWithdrawal(dto),
      invalidatesTags: [...MONEY_MOVED],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(withdrawalApi.util.upsertQueryData('getWithdrawal', data.id, data));
        } catch {
          // The wizard reports the failure.
        }
      },
    }),
    /** History, newest first; the status filter is the cache key. */
    getWithdrawals: builder.infiniteQuery<WithdrawalsPage, WithdrawalFilters, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/wallet/withdrawals',
        params: { ...queryArg, page: pageParam, per_page: WITHDRAWALS_PER_PAGE },
      }),
      transformResponse: (dto: WithdrawalsPageDto) => mapWithdrawalsPage(dto),
      providesTags: [{ type: 'Withdrawal', id: 'LIST' }],
    }),
    getWithdrawal: builder.query<Withdrawal, string>({
      query: id => `/wallet/withdrawals/${encodeURIComponent(id)}`,
      transformResponse: (dto: WithdrawalDto) => mapWithdrawal(dto),
      providesTags: (_result, _error, id) => [{ type: 'Withdrawal', id }],
    }),
    /** Pending only (else `409 withdrawal_not_pending`); the held amount goes back to the balance. */
    cancelWithdrawal: builder.mutation<Withdrawal, CancelWithdrawalArgs>({
      query: ({ id, idempotencyKey }) => ({
        url: `/wallet/withdrawals/${encodeURIComponent(id)}/cancel`,
        method: 'POST',
        headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
      }),
      transformResponse: (dto: WithdrawalDto) => mapWithdrawal(dto),
      invalidatesTags: (_result, _error, { id }) => [...MONEY_MOVED, { type: 'Withdrawal', id }],
    }),
  }),
});

export const {
  useGetWithdrawalQuoteQuery,
  useCreateWithdrawalMutation,
  useGetWithdrawalsInfiniteQuery,
  useGetWithdrawalQuery,
  useCancelWithdrawalMutation,
} = withdrawalApi;
