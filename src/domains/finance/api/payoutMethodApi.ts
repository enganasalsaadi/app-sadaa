import { baseApi } from '@/core/api';
import type {
  CreatePayoutMethodInput,
  DeletePayoutMethodDto,
  PayoutMethod,
  PayoutMethodDto,
  UpdatePayoutMethodArgs,
} from '../types';
import {
  mapPayoutMethod,
  mapPayoutMethods,
  nextPrimaryAfterDelete,
  removePayoutMethod,
} from '../utils/payoutMethodMappers';

const LIST = { type: 'PayoutMethod', id: 'LIST' } as const;

/**
 * Creator payout methods (handoff §7). Not money requests, so no `Idempotency-Key`
 * (rule 06): a repeated save only edits the same destination.
 */
export const payoutMethodApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getPayoutMethods: builder.query<PayoutMethod[], void>({
      query: () => '/wallet/payout-methods',
      transformResponse: (dto: PayoutMethodDto[] | null) => mapPayoutMethods(dto),
      providesTags: result => [...(result?.map(method => ({ type: 'PayoutMethod' as const, id: method.id })) ?? []), LIST],
    }),
    createPayoutMethod: builder.mutation<PayoutMethod | null, CreatePayoutMethodInput>({
      query: body => ({ url: '/wallet/payout-methods', method: 'POST', body }),
      transformResponse: (dto: PayoutMethodDto) => mapPayoutMethod(dto),
      invalidatesTags: [LIST],
    }),
    updatePayoutMethod: builder.mutation<PayoutMethod | null, UpdatePayoutMethodArgs>({
      query: ({ id, patch }) => ({
        url: `/wallet/payout-methods/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: (dto: PayoutMethodDto) => mapPayoutMethod(dto),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PayoutMethod', id }],
    }),
    /** Primary flag moves server-side; the refetch brings the server's order back. */
    setDefaultPayoutMethod: builder.mutation<PayoutMethod | null, string>({
      query: id => ({ url: `/wallet/payout-methods/${encodeURIComponent(id)}/default`, method: 'POST' }),
      transformResponse: (dto: PayoutMethodDto) => mapPayoutMethod(dto),
      invalidatesTags: [LIST],
    }),
    /** Gone from the list at once; the server's new primary is flagged once it answers. */
    deletePayoutMethod: builder.mutation<DeletePayoutMethodDto, string>({
      query: id => ({ url: `/wallet/payout-methods/${encodeURIComponent(id)}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          payoutMethodApi.util.updateQueryData('getPayoutMethods', undefined, draft =>
            removePayoutMethod(
              draft,
              id,
              // Deleting the primary promotes the newest remaining method (handoff §7).
              nextPrimaryAfterDelete(draft, id)?.id ?? draft.find(method => method.is_default)?.id ?? null,
            ),
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            payoutMethodApi.util.updateQueryData('getPayoutMethods', undefined, draft =>
              removePayoutMethod(draft, id, data.default_payout_method_id),
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetPayoutMethodsQuery,
  useCreatePayoutMethodMutation,
  useUpdatePayoutMethodMutation,
  useSetDefaultPayoutMethodMutation,
  useDeletePayoutMethodMutation,
} = payoutMethodApi;
