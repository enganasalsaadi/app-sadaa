import type { AppApiError } from '@/core/api';
import { createIdempotentAction, normalizeApiError } from '@/core/api';
import type { CampaignActionResult } from '../../types/campaign';
import { mapCampaignActionResult } from '../campaignMappers';
import { isCampaignConflictError, settleCampaignAction } from '../campaignAction';
import { detailDto } from '../__fixtures__/campaignDto';

const apiError = (status: number, code: string | null): AppApiError =>
  normalizeApiError({ status, data: { success: false, message: 'server words', error_code: code } });

const result: CampaignActionResult = mapCampaignActionResult(detailDto());

describe('isCampaignConflictError', () => {
  it('is a 409 campaign_* only', () => {
    expect(isCampaignConflictError(apiError(409, 'campaign_invalid_transition'))).toBe(true);
    expect(isCampaignConflictError(apiError(409, 'idempotency_key_reused'))).toBe(false);
    expect(isCampaignConflictError(apiError(422, 'campaign_not_ready'))).toBe(false);
    expect(isCampaignConflictError(apiError(403, 'kyc_required'))).toBe(false);
    expect(isCampaignConflictError(apiError(409, null))).toBe(false);
  });
});

describe('settleCampaignAction', () => {
  it('returns the result on success', async () => {
    const notify = jest.fn();
    await expect(settleCampaignAction(async () => result, null, notify)).resolves.toEqual({ ok: true, result });
    expect(notify).not.toHaveBeenCalled();
  });

  it('reports a conflict and drops the idempotency key', async () => {
    const notify = jest.fn();
    const intent = createIdempotentAction();
    const reset = jest.spyOn(intent, 'reset');
    const failure = { status: 409, data: { success: false, message: 'It moved', error_code: 'campaign_invalid_transition' } };

    const outcome = await settleCampaignAction(() => Promise.reject(failure), intent, notify);

    expect(outcome).toMatchObject({ ok: false, conflict: true });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ code: 'campaign_invalid_transition', message: 'It moved' }));
    expect(reset).toHaveBeenCalled();
  });

  it('hands a validation failure back to the screen without a toast', async () => {
    const notify = jest.fn();
    const failure = { status: 422, data: { success: false, message: 'Missing', error_code: 'campaign_not_ready', meta: { missing: ['cover'] } } };

    const outcome = await settleCampaignAction(() => Promise.reject(failure), null, notify);

    expect(outcome).toMatchObject({ ok: false, conflict: false });
    expect(notify).not.toHaveBeenCalled();
  });
});

describe('mapCampaignActionResult', () => {
  const wallet = { balance_usd: '10.00', required_usd: '80.00', shortfall_usd: '70.00', is_sufficient: false };

  it('has no wallet on a plain action', () => {
    expect(mapCampaignActionResult(detailDto()).wallet).toBeNull();
  });

  it('reads the wallet from meta, or from data when that is where it sits', () => {
    expect(mapCampaignActionResult(detailDto(), { wallet }).wallet?.required).toEqual({ amount: 8000, currency: 'USD' });
    expect(mapCampaignActionResult({ ...detailDto(), wallet }).wallet?.isSufficient).toBe(false);
  });
});
