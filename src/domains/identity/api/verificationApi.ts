import { baseApi } from '@/core/api';
import type {
  DomainVerification,
  DomainVerificationDto,
  SocialProof,
  SocialProofDto,
  StartDomainVerificationRequest,
  StartSocialProofRequest,
} from '../types/verification';
import { toDomainVerification, toSocialProof } from '../utils/verificationMappers';

const SOCIAL_TAG = { type: 'Verification', id: 'SOCIAL' } as const;
const DOMAIN_TAG = { type: 'Verification', id: 'DOMAIN' } as const;

/**
 * Brand company verification routes 2 (social page DM proof) and 3 (domain email),
 * `docs/company-verification.md`. Not money: no Idempotency-Key. A start replaces the pending
 * attempt; once verified every start answers 409 `kyc_already_verified`; 429 carries `retryAfter`
 * (`domain_verification_cooldown` = the 60 s resend cooldown).
 */
export const verificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Latest proof, `null` when none was ever started. */
    getSocialProof: builder.query<SocialProof | null, void>({
      query: () => '/brand/verification/social-dm',
      transformResponse: (dto: SocialProofDto | null) => (dto ? toSocialProof(dto) : null),
      providesTags: [SOCIAL_TAG],
    }),
    startSocialProof: builder.mutation<SocialProof, StartSocialProofRequest>({
      query: body => ({ url: '/brand/verification/social-dm', method: 'POST', body }),
      transformResponse: (dto: SocialProofDto) => toSocialProof(dto),
      // `kyc.method` on `/me` and `/user/kyc` now names this route.
      invalidatesTags: ['User', 'Kyc'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(verificationApi.util.upsertQueryData('getSocialProof', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
    /** Latest attempt (restores "check your inbox" after a restart), `null` when none. */
    getDomainVerification: builder.query<DomainVerification | null, void>({
      query: () => '/brand/verification/domain-email',
      transformResponse: (dto: DomainVerificationDto | null) =>
        dto ? toDomainVerification(dto) : null,
      providesTags: [DOMAIN_TAG],
    }),
    /** Start or resend (same body again). */
    startDomainVerification: builder.mutation<DomainVerification, StartDomainVerificationRequest>({
      query: body => ({ url: '/brand/verification/domain-email', method: 'POST', body }),
      transformResponse: (dto: DomainVerificationDto) => toDomainVerification(dto),
      invalidatesTags: ['User', 'Kyc'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(verificationApi.util.upsertQueryData('getDomainVerification', undefined, data));
        } catch {
          // The screen reports the failure.
        }
      },
    }),
  }),
});

export const {
  useGetSocialProofQuery,
  useStartSocialProofMutation,
  useGetDomainVerificationQuery,
  useStartDomainVerificationMutation,
} = verificationApi;
