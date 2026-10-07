import type { PlatformResource } from '@/domains/auth';
import {
  formatFollowers,
  orderPlatforms,
  resolvePlatformIssue,
} from '../platformsLayout';

jest.mock('lucide-react-native', () => ({
  PauseCircle: 'PauseCircle',
  Clock: 'Clock',
  AlertCircle: 'AlertCircle',
}));

jest.mock('@/domains/identity', () => ({
  PLATFORM_STATUS_PILL: jest.requireActual<{ PLATFORM_STATUS_PILL: object }>(
    '@/domains/identity/constants/platformStatus',
  ).PLATFORM_STATUS_PILL,
}));

const platform = (
  overrides: Partial<PlatformResource> = {},
): PlatformResource => ({
  id: 'p1',
  platform: 'instagram',
  platform_label: 'Instagram',
  username: 'leila',
  profile_url: null,
  display_name: null,
  follower_count: 12400,
  follower_tier: 'MICRO',
  follower_tier_label: 'Micro',
  tier_source: 'auto',
  verification_status: 'auto_verified',
  rejection_reason: null,
  is_primary: false,
  is_available: true,
  supports_lookup: true,
  last_synced_at: null,
  ...overrides,
});

const ids = (list: PlatformResource[]) => list.map(p => p.id);

describe('orderPlatforms', () => {
  it('puts the primary account first and keeps the rest in order', () => {
    expect(
      ids(
        orderPlatforms([
          platform({ id: 'a' }),
          platform({ id: 'b', is_primary: true }),
          platform({ id: 'c' }),
        ]),
      ),
    ).toEqual(['b', 'a', 'c']);
  });

  it('keeps server order when none is primary', () => {
    expect(
      ids(orderPlatforms([platform({ id: 'a' }), platform({ id: 'b' })])),
    ).toEqual(['a', 'b']);
  });
});

describe('resolvePlatformIssue', () => {
  it('has nothing to flag for a verified, available platform', () => {
    expect(resolvePlatformIssue(platform())).toBeNull();
  });

  it('lets a review problem outrank a paused account', () => {
    expect(
      resolvePlatformIssue(
        platform({ verification_status: 'rejected', is_available: false }),
      ),
    ).toMatchObject({
      labelKey: 'account.platforms.status.rejected',
      tone: 'danger',
    });
  });

  it('flags a paused account', () => {
    expect(
      resolvePlatformIssue(platform({ is_available: false })),
    ).toMatchObject({
      labelKey: 'account.platforms.unavailable',
    });
  });
});

describe('formatFollowers', () => {
  it('shows a dash when the platform reports no count', () => {
    expect(formatFollowers(null)).toBe('—');
  });
});
