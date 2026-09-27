import { authStorage } from '@/core/storage';
import { baseApi } from '@/core/api';
import { setToken, syncOnboardingStep } from '../store';
import type {
  BrandStep1Request,
  BrandStep1Response,
  BrandStep2Request,
  BrandOnboardingProgress,
} from '../store';

// Wizard step ↔ server step: account = server step-1, phone OTP has no server
// step (it's /auth/verify-otp), profile = step-2, KYC = step-3. After every
// write the client re-reads /onboarding/progress (useBrandOnboardingFlow)
// instead of guessing the next step (rule 06).
export const brandOnboardingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Creates the draft account, logs it in and sends the phone OTP. AppStatus
    // then flips to REGISTRATION_INCOMPLETE on its own — no navigation here.
    brandStep1: builder.mutation<BrandStep1Response, BrandStep1Request>({
      query: body => ({ url: '/onboarding/brand/step-1', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          authStorage.saveToken(data.token);
          dispatch(
            setToken({
              token: data.token,
              userType: data.user_type,
              currentStep: data.current_step,
              isOnboardingComplete: data.is_onboarding_complete,
              phone: arg.phone,
              otpSentAt: Date.now(),
            }),
          );
        } catch {}
      },
    }),
    // Re-submitting overwrites the draft profile (back-navigation from KYC).
    brandStep2Profile: builder.mutation<void, BrandStep2Request>({
      query: body => ({ url: '/onboarding/brand/step-2', method: 'POST', body }),
    }),
    // Multipart. Optional: a FormData without `kyc_document` is the skip.
    brandStep3Kyc: builder.mutation<void, FormData>({
      query: body => ({ url: '/onboarding/brand/step-3', method: 'POST', body }),
    }),
    getOnboardingProgress: builder.query<BrandOnboardingProgress, void>({
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
  useBrandStep1Mutation,
  useBrandStep2ProfileMutation,
  useBrandStep3KycMutation,
  useGetOnboardingProgressQuery,
} = brandOnboardingApi;
