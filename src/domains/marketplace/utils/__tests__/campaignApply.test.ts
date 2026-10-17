import type { AppApiError } from '@/core/api';
import type { PlatformResource } from '@/domains/auth';
import {
  accountChoices,
  applyFieldErrors,
  applyRefusal,
  bidIssue,
  defaultAccounts,
  defaultBid,
  estimateNet,
  requiredPlatforms,
  rulerPosition,
  toApplyBody,
} from '../campaignApply';

const usd = (amount: number) => ({ amount, currency: 'USD' as const });
const account = (overrides: Partial<PlatformResource> = {}): PlatformResource => ({
  id: 'acc-1',
  platform: 'instagram',
  platform_label: 'إنستغرام',
  username: 'yasmin',
  profile_url: null,
  display_name: null,
  follower_count: 24_500,
  follower_tier: null,
  follower_tier_label: null,
  tier_source: 'auto',
  verification_status: 'auto_verified',
  rejection_reason: null,
  is_primary: false,
  is_available: true,
  supports_lookup: true,
  last_synced_at: null,
  ...overrides,
});
const apiError = (code: AppApiError['code'], message = 'server words'): AppApiError => ({
  statusCode: 422,
  message,
  code,
  retryAfter: null,
  reason: null,
  availableAt: null,
  details: null,
  isValidationError: true,
  isUnauthorized: false,
  isForbidden: false,
  isServerError: false,
});

describe('estimateNet', () => {
  it('takes the campaign fee off the bid', () => {
    expect(estimateNet(usd(9000), 1000)).toEqual({ gross: usd(9000), fee: usd(900), net: usd(8100) });
  });

  it('rounds the fee to a whole cent', () => {
    expect(estimateNet(usd(999), 1000).fee).toEqual(usd(100));
    expect(estimateNet(usd(999), 1000).net).toEqual(usd(899));
  });
});

describe('bidIssue', () => {
  const max = usd(10_000);

  it('asks for a bid when there is none', () => {
    expect(bidIssue(null, max)).toBe('empty');
    expect(bidIssue(usd(0), max)).toBe('empty');
  });

  it('refuses under $5 and over the binding maximum', () => {
    expect(bidIssue(usd(499), max)).toBe('low');
    expect(bidIssue(usd(10_001), max)).toBe('high');
  });

  it('accepts the two ends', () => {
    expect(bidIssue(usd(500), max)).toBeNull();
    expect(bidIssue(usd(10_000), max)).toBeNull();
  });
});

describe('defaultBid', () => {
  it('starts on the suggested minimum', () => {
    expect(defaultBid(usd(6000), usd(10_000))).toEqual(usd(6000));
  });

  it('stays inside $5 and the maximum', () => {
    expect(defaultBid(usd(100), usd(10_000))).toEqual(usd(500));
    expect(defaultBid(usd(20_000), usd(10_000))).toEqual(usd(10_000));
  });
});

describe('rulerPosition', () => {
  it('runs from $5 to the maximum', () => {
    expect(rulerPosition(500, usd(10_500))).toBe(0);
    expect(rulerPosition(5500, usd(10_500))).toBe(0.5);
    expect(rulerPosition(10_500, usd(10_500))).toBe(1);
  });

  it('clamps and survives a maximum at the floor', () => {
    expect(rulerPosition(99_999, usd(10_000))).toBe(1);
    expect(rulerPosition(100, usd(10_000))).toBe(0);
    expect(rulerPosition(500, usd(500))).toBe(1);
  });
});

describe('requiredPlatforms', () => {
  it('lists each platform once, in the campaign order', () => {
    const deliverable = (key: string) => ({
      platform: { key, label: key },
      service: { key: 'reel', label: 'ريل' },
      count: 1,
      revisions: 0,
      addons: [],
    });
    const keys = requiredPlatforms([deliverable('instagram'), deliverable('tiktok'), deliverable('instagram')]).map(
      platform => platform.key,
    );
    expect(keys).toEqual(['instagram', 'tiktok']);
  });
});

describe('accountChoices', () => {
  it('keeps only that platform, the primary account first', () => {
    const choices = accountChoices(
      'instagram',
      [account({ id: 'a' }), account({ id: 'b', is_primary: true }), account({ id: 't', platform: 'tiktok' })],
      null,
    );
    expect(choices.map(choice => choice.account.id)).toEqual(['b', 'a']);
  });

  it('says why an account cannot apply', () => {
    const [low, review, rejected, away, ok] = accountChoices(
      'instagram',
      [
        account({ id: 'low', follower_count: 3200 }),
        account({ id: 'review', verification_status: 'pending_review' }),
        account({ id: 'rejected', verification_status: 'rejected' }),
        account({ id: 'away', is_available: false }),
        account({ id: 'ok' }),
      ],
      5000,
    );
    expect(low?.block).toEqual({ kind: 'followers', min: 5000 });
    expect(review?.block).toEqual({ kind: 'review' });
    expect(rejected?.block).toEqual({ kind: 'rejected' });
    expect(away?.block).toEqual({ kind: 'unavailable' });
    expect(ok?.block).toBeNull();
  });

  it('leaves a manual account (no follower count) to the server', () => {
    const [manual] = accountChoices('telegram', [account({ platform: 'telegram', follower_count: null })], 5000);
    expect(manual?.block).toBeNull();
  });
});

describe('defaultAccounts', () => {
  it('picks the first usable account per platform and skips a platform with none', () => {
    const picked = defaultAccounts(
      [
        { key: 'instagram', label: 'إنستغرام' },
        { key: 'tiktok', label: 'تيك توك' },
      ],
      [account({ id: 'low', follower_count: 100, is_primary: true }), account({ id: 'ok' })],
      5000,
    );
    expect(picked).toEqual({ instagram: 'ok' });
  });
});

describe('toApplyBody', () => {
  const args = {
    id: 'c1',
    pitch: '  أقترح ريلاً  ',
    bid: usd(9000),
    accounts: { instagram: 'acc-1' },
    deviceId: 'dev-1',
    idempotencyKey: 'key-1',
  };

  it('sends the trimmed pitch, the bid as a decimal and the device', () => {
    expect(toApplyBody(args)).toEqual({
      pitch: 'أقترح ريلاً',
      bid_usd: '90.00',
      accounts: { instagram: 'acc-1' },
      device_id: 'dev-1',
    });
  });

  it('leaves out a blank pitch and the bid of a fixed price', () => {
    expect(toApplyBody({ ...args, pitch: '   ', bid: null })).toEqual({
      accounts: { instagram: 'acc-1' },
      device_id: 'dev-1',
    });
  });
});

describe('applyFieldErrors', () => {
  const unprocessable = (errors: Record<string, string[]>) => ({ status: 422, data: { errors } });

  it('maps the bid and each platform', () => {
    expect(
      applyFieldErrors(unprocessable({ bid_usd: ['too high'], 'accounts.tiktok': ['pick one'] })),
    ).toEqual({ bid: 'too high', accounts: { tiktok: 'pick one' } });
  });

  it('is null when no field of the sheet is named', () => {
    expect(applyFieldErrors(unprocessable({ gender: ['missing'] }))).toBeNull();
    expect(applyFieldErrors({ status: 500 })).toBeNull();
  });
});

describe('applyRefusal', () => {
  it.each([
    ['creator_restricted', 'restricted'],
    ['campaign_profile_incomplete', 'profile'],
    ['campaign_application_limit', 'limit'],
    ['campaign_not_accepting', 'closed'],
    ['campaign_not_eligible', 'closed'],
    [null, 'other'],
  ] as const)('%s → %s, keeping the server words', (code, kind) => {
    expect(applyRefusal(apiError(code))).toEqual({ kind, message: 'server words' });
  });
});
