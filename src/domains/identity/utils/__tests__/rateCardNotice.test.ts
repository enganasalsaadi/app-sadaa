import type { User } from '@/domains/auth';
import { needsRateCards } from '../rateCardNotice';

const steps = (rateCardsDone: boolean): NonNullable<User['profile_completion']> => ({
  percentage: 50,
  earned_points: 50,
  total_points: 100,
  steps: [
    { key: 'platforms', points: 15, completed: true, status: null },
    { key: 'rate_cards', points: 20, completed: rateCardsDone, status: null },
  ],
});

describe('needsRateCards', () => {
  it('is false without a creator', () => {
    expect(needsRateCards(null)).toBe(false);
    expect(
      needsRateCards({ user_type: 'brand', profile_completion: steps(false) }),
    ).toBe(false);
  });

  it('follows the receive_requests blocker', () => {
    expect(
      needsRateCards({
        user_type: 'influencer',
        capabilities: { receive_requests: { allowed: false, reason: 'rate_card_required' } },
        profile_completion: steps(true),
      }),
    ).toBe(true);
  });

  it('follows the open rate_cards step', () => {
    expect(needsRateCards({ user_type: 'influencer', profile_completion: steps(false) })).toBe(true);
  });

  it('clears once a card is saved', () => {
    expect(
      needsRateCards({
        user_type: 'influencer',
        capabilities: { receive_requests: { allowed: false, reason: 'kyc_required' } },
        profile_completion: steps(true),
      }),
    ).toBe(false);
  });
});
