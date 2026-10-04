import { baseApi } from '@/core/api';
import type { KycDetails } from '../types/kyc';

/** In-app identity / business verification (contract §7.3–7.4). */
export const kycApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getKyc: builder.query<KycDetails, void>({
      query: () => '/user/kyc',
      providesTags: ['Kyc'],
    }),
    /** Multipart: creator `id_front` + `id_back`; brand `kyc_document_type` + `kyc_document`. */
    submitKyc: builder.mutation<KycDetails, FormData>({
      query: body => ({ url: '/user/kyc', method: 'POST', body }),
      // `/me` carries the KYC status shown on the Profile.
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(kycApi.util.upsertQueryData('getKyc', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
  }),
});

export const { useGetKycQuery, useSubmitKycMutation } = kycApi;
