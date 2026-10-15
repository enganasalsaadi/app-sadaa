import { createIdempotentAction } from '@/core/api';
import type { AppApiError } from '@/core/api';
import type { DealActionResult } from '../../types/deal';
import { isDealConflictError, settleDealAction } from '../dealAction';

const apiError = (status: number, code: string, message = 'Server says no') => ({
  status,
  data: { success: false, message, error_code: code, data: null },
});

const appError = (statusCode: number, code: AppApiError['code']): AppApiError => ({
  statusCode,
  message: 'x',
  code,
  retryAfter: null,
  reason: null,
  availableAt: null,
  details: null,
  isValidationError: false,
  isUnauthorized: false,
  isForbidden: false,
  isServerError: false,
});

const result = { upsellId: null } as DealActionResult;

describe('isDealConflictError', () => {
  it('flags 409 and 403 deal codes only', () => {
    expect(isDealConflictError(appError(409, 'deal_deadline_passed'))).toBe(true);
    expect(isDealConflictError(appError(403, 'deal_dispute_not_open'))).toBe(true);
    expect(isDealConflictError(appError(422, 'deal_live_url_invalid'))).toBe(false);
    expect(isDealConflictError(appError(409, 'idempotency_request_in_progress'))).toBe(false);
    expect(isDealConflictError(appError(409, null))).toBe(false);
  });
});

describe('settleDealAction', () => {
  it('returns the server deal on success', async () => {
    const notify = jest.fn();
    await expect(settleDealAction(async () => result, null, notify)).resolves.toEqual({ ok: true, result });
    expect(notify).not.toHaveBeenCalled();
  });

  it('reports a conflict', async () => {
    const notify = jest.fn();
    const outcome = await settleDealAction(
      async () => {
        throw apiError(409, 'deal_deadline_passed', 'The offer has closed');
      },
      null,
      notify,
    );

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'deal_deadline_passed', message: 'The offer has closed' }),
    );
    expect(outcome).toMatchObject({ ok: false, conflict: true, error: { code: 'deal_deadline_passed' } });
  });

  it('hands other failures back silently', async () => {
    const notify = jest.fn();
    const outcome = await settleDealAction(
      async () => {
        throw apiError(422, 'deal_live_url_invalid');
      },
      null,
      notify,
    );

    expect(notify).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({ ok: false, conflict: false, error: { statusCode: 422 } });
  });

  it('keeps the key across a transport retry and drops it after a conflict', async () => {
    const keys = ['k1', 'k2'];
    const intent = createIdempotentAction(() => keys.shift() ?? 'k?');
    const sent: (string | undefined)[] = [];
    const failWith = (error: unknown) => async (key?: string) => {
      sent.push(key);
      throw error;
    };

    await settleDealAction(failWith({ status: 'FETCH_ERROR', error: 'offline' }), intent, jest.fn());
    await settleDealAction(failWith(apiError(409, 'deal_upsell_pending')), intent, jest.fn());
    await settleDealAction(async key => {
      sent.push(key);
      return result;
    }, intent, jest.fn());

    expect(sent).toEqual(['k1', 'k1', 'k2']);
  });
});
