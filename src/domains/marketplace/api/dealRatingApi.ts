import { baseApi, normalizeApiError } from '@/core/api';
import type { DealRatingEntry, DealRatingRequest, DealRef } from '../types/deal';
import type { DealRatingEntryDto } from '../types/dealDto';
import { isDealConflictError } from '../utils/dealAction';
import { mapDealRatingEntry } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';

export interface RateDealArgs {
  ref: DealRef;
  body: DealRatingRequest;
}

/**
 * Both answer only the caller's own rating, not the deal: the deal (its `rating` sides), the
 * ticket's next line and the history note are read again. A `deal_rating_*` conflict (window
 * closed, already answered) refetches the same, since the deal moved under the user.
 */
const ratingTags = (_result: unknown, error: unknown, ref: DealRef) =>
  !error || isDealConflictError(normalizeApiError(error))
    ? [
        { type: 'Deal' as const, id: ref.id },
        { type: 'DealList' as const, id: 'LIST' },
        { type: 'DealHistory' as const, id: ref.id },
      ]
    : [];

/** Mutual rating (handoff M10), both roles. Not money: no idempotency key. */
export const dealRatingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    rateDeal: builder.mutation<DealRatingEntry, RateDealArgs>({
      query: ({ ref, body }) => ({
        url: buildDealUrl(ref, 'rating'),
        method: 'POST',
        body,
      }),
      transformResponse: (dto: DealRatingEntryDto) => mapDealRatingEntry(dto),
      invalidatesTags: (result, error, { ref }) => ratingTags(result, error, ref),
    }),
    /** Final: the server takes no rating from this side afterwards. */
    skipDealRating: builder.mutation<DealRatingEntry, DealRef>({
      query: ref => ({
        url: buildDealUrl(ref, 'rating/skip'),
        method: 'POST',
        body: {},
      }),
      transformResponse: (dto: DealRatingEntryDto) => mapDealRatingEntry(dto),
      invalidatesTags: (result, error, ref) => ratingTags(result, error, ref),
    }),
  }),
});

export const { useRateDealMutation, useSkipDealRatingMutation } = dealRatingApi;
