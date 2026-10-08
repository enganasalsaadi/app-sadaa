import { baseApi } from '@/core/api';
import type { RateCard, RateCardInput, RateCardPatch } from '@/domains/auth';

export interface UpdateRateCardRequest {
  id: string;
  patch: RateCardPatch;
}

/**
 * A saved card changes `/me` (completion, `receive_requests`) and the own-kit
 * preview's prices; the list itself is patched from the reply, not refetched.
 */
const DEPENDENT_TAGS = ['User', 'MediaKit'] as const;
const LIST_TAG = { type: 'RateCard', id: 'LIST' } as const;

/** Rate Cards v2, per-card routes (handoff §4). Influencer only. */
export const rateCardsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getRateCards: builder.query<RateCard[], void>({
      query: () => '/influencer/rate-cards',
      providesTags: result => [
        ...(result ?? []).map(card => ({ type: 'RateCard' as const, id: card.id })),
        LIST_TAG,
      ],
    }),
    createRateCard: builder.mutation<RateCard, RateCardInput>({
      query: body => ({ url: '/influencer/rate-cards', method: 'POST', body }),
      invalidatesTags: [...DEPENDENT_TAGS],
      // Lands before the caller's `unwrap()`: the list shows the new card on the way back.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            rateCardsApi.util.updateQueryData('getRateCards', undefined, list => {
              list.push(data);
            }),
          );
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    updateRateCard: builder.mutation<RateCard, UpdateRateCardRequest>({
      query: ({ id, patch }) => ({ url: `/influencer/rate-cards/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: [...DEPENDENT_TAGS],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            rateCardsApi.util.updateQueryData('getRateCards', undefined, list => {
              const index = list.findIndex(card => card.id === id);
              if (index !== -1) list[index] = data;
            }),
          );
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    deleteRateCard: builder.mutation<null, string>({
      query: id => ({ url: `/influencer/rate-cards/${id}`, method: 'DELETE' }),
      invalidatesTags: [...DEPENDENT_TAGS],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          rateCardsApi.util.updateQueryData('getRateCards', undefined, list =>
            list.filter(card => card.id !== id),
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    /**
     * Bulk upsert by slot (ids kept for cards that stay), all-or-nothing; 422 keys
     * are prefixed `rate_cards.{i}.`. No screen calls it yet: kept typed for the
     * planned bulk editor, so its hook is not exported.
     */
    replaceRateCards: builder.mutation<RateCard[], RateCardInput[]>({
      query: rateCards => ({ url: '/influencer/rate-cards', method: 'PUT', body: { rate_cards: rateCards } }),
      invalidatesTags: [LIST_TAG, ...DEPENDENT_TAGS],
    }),
  }),
});

export const {
  useGetRateCardsQuery,
  useCreateRateCardMutation,
  useUpdateRateCardMutation,
  useDeleteRateCardMutation,
} = rateCardsApi;
