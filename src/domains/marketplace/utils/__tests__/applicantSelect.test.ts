import type { AppApiError } from '@/core/api';
import type { Money } from '@/core/money';
import type { CampaignDeliverable } from '../../types/campaign';
import { deliverablesSummary, isSelectRefusal, selectEstimate } from '../applicantSelect';
import { firstNameOf } from '../creatorText';

const usd = (amount: number): Money => ({ amount, currency: 'USD' });

const apiError = (statusCode: number, code: AppApiError['code']): AppApiError => ({
  statusCode,
  message: 'm',
  code,
  retryAfter: null,
  reason: null,
  availableAt: null,
  details: null,
  isValidationError: statusCode === 422,
  isUnauthorized: false,
  isForbidden: statusCode === 403,
  isServerError: statusCode >= 500,
});

describe('selectEstimate', () => {
  it('covers when the balance reaches the price, exactly or beyond', () => {
    expect(selectEstimate(usd(20000), usd(20000))).toEqual({ kind: 'covers' });
    expect(selectEstimate(usd(25000), usd(20000))).toEqual({ kind: 'covers' });
  });

  it('is short by the difference', () => {
    expect(selectEstimate(usd(18000), usd(20000))).toEqual({ kind: 'short', shortfall: usd(2000) });
  });

  it('says nothing when the balance is unknown or in another currency', () => {
    expect(selectEstimate(null, usd(20000))).toEqual({ kind: 'unknown' });
    expect(selectEstimate({ amount: 99999, currency: 'SYP' }, usd(20000))).toEqual({ kind: 'unknown' });
  });
});

describe('deliverablesSummary', () => {
  const item = (service: string, count: number): CampaignDeliverable => ({
    id: service,
    platform: { key: 'instagram', label: 'Instagram' },
    service: { key: service, label: service },
    count,
    revisions: 1,
    addons: [],
  });

  it('lists each service with its count, in the campaign order', () => {
    expect(deliverablesSummary([item('Reel', 1), item('Story', 2)])).toBe('Reel ×1 · Story ×2');
  });

  it('is empty without deliverables', () => {
    expect(deliverablesSummary([])).toBe('');
  });
});

describe('isSelectRefusal', () => {
  it('closes the sheet for a moved campaign or card', () => {
    expect(isSelectRefusal(apiError(409, 'campaign_no_free_seat'))).toBe(true);
    expect(isSelectRefusal(apiError(409, 'campaign_application_expired'))).toBe(true);
    expect(isSelectRefusal(apiError(409, 'campaign_drop_too_close'))).toBe(true);
  });

  it('closes it for a budget or availability refusal, which a second hold cannot fix', () => {
    expect(isSelectRefusal(apiError(422, 'campaign_budget_exceeded'))).toBe(true);
    expect(isSelectRefusal(apiError(422, 'campaign_applicant_unavailable'))).toBe(true);
  });

  it('keeps it for KYC, other validation and transport failures', () => {
    expect(isSelectRefusal(apiError(403, 'kyc_required'))).toBe(false);
    expect(isSelectRefusal(apiError(422, 'validation_failed'))).toBe(false);
    expect(isSelectRefusal(apiError(500, null))).toBe(false);
    expect(isSelectRefusal(apiError(409, 'idempotency_request_in_progress'))).toBe(false);
  });
});

describe('firstNameOf', () => {
  it('keeps the first word, trimmed', () => {
    expect(firstNameOf('  سارة الحلبي ')).toBe('سارة');
    expect(firstNameOf('Lin')).toBe('Lin');
    expect(firstNameOf('')).toBe('');
  });
});
