import type { SocialLookupResult } from '../../store';
import { outcomeFromError, outcomeFromResult, platformRowErrors } from '../socialLookup';

const NOW = 1_000_000;
const profile = {
  platform: 'instagram',
  username: 'anas',
  display_name: 'Anas',
  follower_count: 45210,
  follower_tier: 'MICRO' as const,
  is_verified_account: false,
  profile_url: 'https://instagram.com/anas',
  avatar_url: null,
  fetched_at: '2026-10-01T10:00:00Z',
};
const result = (patch: Partial<SocialLookupResult>): SocialLookupResult => ({
  status: 'found',
  source: 'live',
  manual_entry_allowed: false,
  already_claimed: false,
  profile,
  ...patch,
});

describe('outcomeFromResult', () => {
  it('maps every status', () => {
    expect(outcomeFromResult(result({}))).toEqual({ kind: 'found', profile });
    expect(outcomeFromResult(result({ status: 'not_found', profile: null }))).toEqual({
      kind: 'notFound',
    });
    expect(outcomeFromResult(result({ status: 'unavailable', profile: null }))).toEqual({
      kind: 'unavailable',
    });
    expect(outcomeFromResult(result({ status: 'manual_required', profile: null }))).toEqual({
      kind: 'manual',
    });
  });

  it('blocks a handle claimed by another influencer', () => {
    expect(outcomeFromResult(result({ already_claimed: true }))).toEqual({ kind: 'claimed' });
  });

  it('treats found without a profile as unavailable', () => {
    expect(outcomeFromResult(result({ profile: null }))).toEqual({ kind: 'unavailable' });
  });
});

describe('outcomeFromError', () => {
  it('puts a 422 handle message under the field', () => {
    const error = { statusCode: 422, code: 'validation_failed', retryAfter: null } as const;
    expect(outcomeFromError(error, { handle: 'Invalid handle' }, NOW)).toEqual({
      kind: 'invalid',
      message: 'Invalid handle',
    });
  });

  it('throttles for retry_after on 429', () => {
    const error = { statusCode: 429, code: 'too_many_requests', retryAfter: 120 } as const;
    expect(outcomeFromError(error, null, NOW)).toEqual({ kind: 'throttled', until: NOW + 120_000 });
  });

  it('falls back to a manual tier on anything else', () => {
    const timeout = { statusCode: null, code: null, retryAfter: null };
    expect(outcomeFromError(timeout, null, NOW)).toEqual({ kind: 'unavailable' });
  });
});

describe('platformRowErrors', () => {
  it('maps platforms.N.* onto the N-th platform, first message wins', () => {
    expect(
      platformRowErrors(
        {
          'platforms.1.handle': 'Claimed',
          'platforms.1.follower_tier': 'Required',
          'platforms.5.handle': 'Out of range',
          niches: 'Too many',
        },
        ['instagram', 'tiktok'],
      ),
    ).toEqual({ tiktok: 'Claimed' });
  });

  it('returns nothing without field errors', () => {
    expect(platformRowErrors(null, ['instagram'])).toEqual({});
  });
});
