import { baseApi } from '@/core/api';
import { syncOnboardingStep } from '../store';
import type {
  InfluencerOnboardingProgress,
  InfluencerStep1Request,
  InfluencerStep1Response,
  InfluencerStep2Request,
  InfluencerStep3Request,
} from '../store';
import { startOnboardingSession } from './onboardingSession';

// Wizard step ↔ server step: account = step-1, phone OTP = /auth/verify-otp,
// niches + platforms = step-2, rates = step-3 (skippable, completes onboarding).
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
    influencerStep2Socials: builder.mutation<void, InfluencerStep2Request>({
      query: body => ({ url: '/onboarding/influencer/step-2', method: 'POST', body }),
    }),
    influencerStep3Rates: builder.mutation<void, InfluencerStep3Request>({
      query: body => ({ url: '/onboarding/influencer/step-3', method: 'POST', body }),
    }),
    getInfluencerOnboardingProgress: builder.query<InfluencerOnboardingProgress, void>({
      query: () => '/onboarding/progress',
      providesTags: ['OnboardingProgress'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(syncOnboardingStep(data.current_step));
        } catch {}
      },
    }),
  }),
});

export const {
  useInfluencerStep1Mutation,
  useInfluencerStep2SocialsMutation,
  useInfluencerStep3RatesMutation,
  useGetInfluencerOnboardingProgressQuery,
} = influencerOnboardingApi;
