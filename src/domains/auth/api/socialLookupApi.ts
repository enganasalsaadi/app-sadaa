import { baseApi } from '@/core/api';
import type { SocialLookupRequest, SocialLookupResult } from '../store';

/** The provider call is synchronous and may take up to 30 s (contract §4). */
const SOCIAL_LOOKUP_TIMEOUT_MS = 35_000;

export const socialLookupApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // A mutation: every call may spend provider credits, so never cached or auto-refetched.
    lookupSocialProfile: builder.mutation<SocialLookupResult, SocialLookupRequest>({
      query: body => ({
        url: '/social/lookup',
        method: 'POST',
        body,
        timeout: SOCIAL_LOOKUP_TIMEOUT_MS,
      }),
    }),
  }),
});

export const { useLookupSocialProfileMutation } = socialLookupApi;
