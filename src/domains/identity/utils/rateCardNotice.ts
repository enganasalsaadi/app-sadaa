import type { User } from '@/domains/auth';

type RateCardSignals = Pick<User, 'user_type' | 'capabilities' | 'profile_completion'>;

/**
 * "Set up your prices" (handoff §2): the creator can't receive requests for
 * lack of a card, or the `rate_cards` completion step is still open. Both flip
 * server-side as soon as one card is saved (the save invalidates `/me`).
 */
export const needsRateCards = (user: RateCardSignals | null | undefined): boolean => {
  if (!user || user.user_type !== 'influencer') return false;
  if (user.capabilities?.receive_requests?.reason === 'rate_card_required') return true;
  return user.profile_completion?.steps.some(step => step.key === 'rate_cards' && !step.completed) ?? false;
};
