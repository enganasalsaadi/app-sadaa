import { baseApi } from '@/core/api';
import { WALLET_ESCROWS_PER_PAGE, WALLET_TRANSACTIONS_PER_PAGE } from '../constants';
import type {
  EarningsPeriod,
  ExchangeRate,
  ExchangeRateDto,
  Wallet,
  WalletDto,
  WalletEarnings,
  WalletEarningsDto,
  WalletEscrows,
  WalletEscrowsDto,
  WalletTransaction,
  WalletTransactionDto,
  WalletTransactionFilters,
  WalletTransactionsPage,
  WalletTransactionsPageDto,
} from '../types';
import {
  mapExchangeRate,
  mapWallet,
  mapWalletEarnings,
  mapWalletEscrows,
  mapWalletTransaction,
  mapWalletTransactionsPage,
} from '../utils/walletMappers';

/** Shared wallet reads, both roles (handoff §5). Wallet pushes refresh them via `walletPushTags`. */
export const walletApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getWallet: builder.query<Wallet, void>({
      query: () => '/wallet',
      transformResponse: (dto: WalletDto) => mapWallet(dto),
      providesTags: ['Wallet'],
    }),
    /** Newest first; filters are the cache key, so each filter keeps its own pages. */
    getWalletTransactions: builder.infiniteQuery<
      WalletTransactionsPage,
      WalletTransactionFilters,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/wallet/transactions',
        params: { ...queryArg, page: pageParam, per_page: WALLET_TRANSACTIONS_PER_PAGE },
      }),
      transformResponse: (dto: WalletTransactionsPageDto) => mapWalletTransactionsPage(dto),
      providesTags: [{ type: 'WalletTransaction', id: 'LIST' }],
    }),
    /** Receipt. References are case-insensitive server-side, so the cache key is upper-cased. */
    getWalletTransaction: builder.query<WalletTransaction, string>({
      query: reference => `/wallet/transactions/${encodeURIComponent(reference)}`,
      transformResponse: (dto: WalletTransactionDto) => mapWalletTransaction(dto),
      providesTags: (_result, _error, reference) => [
        { type: 'WalletTransaction', id: reference.toUpperCase() },
      ],
    }),
    /** Short cache: a stale rate must switch SYP off soon after it goes stale. */
    getExchangeRate: builder.query<ExchangeRate | null, void>({
      query: () => '/finance/exchange-rate',
      transformResponse: (dto: ExchangeRateDto | null) => mapExchangeRate(dto),
      keepUnusedDataFor: 60,
    }),
    /** v4 delta §2. A 404 means the server predates it: the card falls back to its explainer. */
    getWalletEscrows: builder.query<WalletEscrows, void>({
      query: () => ({ url: '/wallet/escrows', params: { per_page: WALLET_ESCROWS_PER_PAGE } }),
      transformResponse: (dto: WalletEscrowsDto) => mapWalletEscrows(dto),
      providesTags: ['WalletEscrow'],
    }),
    /** v4 delta §3: creator earnings / brand campaign spend per month. 404 → the chart stays out. */
    getWalletEarnings: builder.query<WalletEarnings, EarningsPeriod>({
      query: period => ({ url: '/wallet/earnings', params: { period } }),
      transformResponse: (dto: WalletEarningsDto) => mapWalletEarnings(dto),
      providesTags: ['WalletEarnings'],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsInfiniteQuery,
  useGetWalletTransactionQuery,
  useGetExchangeRateQuery,
  useGetWalletEscrowsQuery,
  useGetWalletEarningsQuery,
} = walletApi;
