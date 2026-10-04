import type { TFunction } from 'i18next';
import type { PlatformResource } from '@/domains/auth';
import { platformErrorMessage, toPlatformBody, toPlatformForm } from '../platformForm';

jest.mock('@/domains/auth', () => ({
  isInfluencerPlatform: (value: string) =>
    ['instagram', 'tiktok', 'youtube', 'facebook', 'telegram'].includes(value),
}));

const t = ((key: string) => key) as unknown as TFunction;

const platform = (overrides: Partial<PlatformResource> = {}): PlatformResource => ({
  id: 'p1',
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'sada',
  profile_url: null,
  display_name: null,
  follower_count: 12000,
  follower_tier: 'MICRO',
  follower_tier_label: null,
  tier_source: 'auto',
  verification_status: 'auto_verified',
  rejection_reason: null,
  is_primary: true,
  is_available: true,
  supports_lookup: true,
  last_synced_at: null,
  ...overrides,
});

const apiError = (status: number, error_code: string | null = null) => ({
  status,
  data: { success: false, message: 'x', data: null, error_code, errors: null, meta: {} },
});

describe('toPlatformForm', () => {
  it('maps a saved platform to the sheet values', () => {
    expect(toPlatformForm(platform())).toEqual({
      platform: 'instagram',
      handle: 'sada',
      followerTier: 'MICRO',
      tierSource: 'auto',
      isPrimary: true,
    });
  });

  it('skips platforms the app cannot edit', () => {
    expect(toPlatformForm(platform({ platform: 'website' }))).toBeNull();
  });
});

describe('toPlatformBody', () => {
  it('sends the tier only when there is one', () => {
    const base = { platform: 'tiktok', handle: 'a', tierSource: 'auto', isPrimary: false } as const;
    expect(toPlatformBody({ ...base, followerTier: null })).toEqual({ handle: 'a' });
    expect(toPlatformBody({ ...base, followerTier: 'NANO' })).toEqual({
      handle: 'a',
      follower_tier: 'NANO',
    });
  });
});

describe('platformErrorMessage', () => {
  it('maps platform conflict codes', () => {
    expect(platformErrorMessage(apiError(409, 'last_platform'), t)).toBe(
      'account.platforms.errors.lastPlatform',
    );
    expect(platformErrorMessage(apiError(409, 'platform_already_exists'), t)).toBe(
      'account.platforms.errors.alreadyExists',
    );
  });

  it('stays quiet for errors baseQuery already reported', () => {
    expect(platformErrorMessage(apiError(422), t)).toBeNull();
    expect(platformErrorMessage(apiError(500), t)).toBeNull();
  });

  it('falls back to not-found and generic messages', () => {
    expect(platformErrorMessage(apiError(404), t)).toBe('account.platforms.errors.notFound');
    expect(platformErrorMessage(apiError(400), t)).toBe('errors.generic');
  });
});
