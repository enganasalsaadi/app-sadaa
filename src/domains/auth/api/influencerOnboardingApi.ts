import { baseApi } from '@/core/api';
import { setAccountSuspended, syncOnboardingStep } from '../store';
import type {
  InfluencerOnboardingProgress,
  InfluencerProfileResource,
  InfluencerStep1Request,
  InfluencerStep1Response,
  InfluencerStep2Request,
  InfluencerStep3Request,
} from '../store';
import { startOnboardingSession } from './onboardingSession';

// Wizard step ↔ server step: account = step-1, phone OTP = /auth/verify-otp,
// niches + platforms = step-2, rates = step-3 (skippable), KYC = step-4
// (skippable, completes onboarding).
export const influencerOnboardingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    influencerStep1: builder.mutation<InfluencerStep1Response, InfluencerStep1Request>({
      query: body => ({ url: '/onboarding/influencer/step-1', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          startOnboardingSession(dispatch, data, arg.phone);
        } catch {}
      },
    }),
    // Replaces niches and every platform, so going back and re-saving is safe.
    influencerStep2Socials: builder.mutation<InfluencerProfileResource, InfluencerStep2Request>({
      query: body => ({ url: '/onboarding/influencer/step-2', method: 'POST', body }),
    }),
    influencerStep3Rates: builder.mutation<InfluencerProfileResource, InfluencerStep3Request>({
      query: body => ({ url: '/onboarding/influencer/step-3', method: 'POST', body }),
      invalidatesTags: ['RateCard'],
    }),
    // Multipart: `is_skipped` "1"/"0", `id_front` + `id_back`. Both outcomes
    // complete onboarding.
    influencerStep4Kyc: builder.mutation<InfluencerProfileResource, FormData>({
      query: body => ({ url: '/onboarding/influencer/step-4', method: 'POST', body }),
    }),
    getInfluencerOnboardingProgress: builder.query<InfluencerOnboardingProgress, void>({
      query: () => '/onboarding/progress',
      providesTags: ['OnboardingProgress'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(syncOnboardingStep(data.current_step));
          dispatch(setAccountSuspended(data.status === 'suspended'));
        } catch {}
      },
    }),
  }),
});

export const {
  useInfluencerStep1Mutation,
  useInfluencerStep2SocialsMutation,
  useInfluencerStep3RatesMutation,
  useInfluencerStep4KycMutation,
  useGetInfluencerOnboardingProgressQuery,
} = influencerOnboardingApi;
