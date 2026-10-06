import { normalizeApiError } from '../errorHandler';

const envelope = (overrides: Record<string, unknown>) => ({
  success: false,
  message: 'Please wait 42 seconds',
  errors: null,
  meta: { locale: 'en' },
  ...overrides,
});

describe('normalizeApiError', () => {
  it('maps error_code and meta.retry_after (429 otp_cooldown)', () => {
    const error = normalizeApiError({
      status: 429,
      data: envelope({ error_code: 'otp_cooldown', meta: { locale: 'en', retry_after: 42 } }),
    });

    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('otp_cooldown');
    expect(error.retryAfter).toBe(42);
    expect(error.message).toBe('Please wait 42 seconds');
  });

  it('drops unknown codes and missing retry_after', () => {
    const error = normalizeApiError({
      status: 409,
      data: envelope({ error_code: 'something_new' }),
    });

    expect(error.code).toBeNull();
    expect(error.retryAfter).toBeNull();
  });

  it('never reports a transport failure as a server code', () => {
    const error = normalizeApiError({ status: 'TIMEOUT_ERROR', error: 'timeout' });

    expect(error.statusCode).toBeNull();
    expect(error.code).toBeNull();
    expect(error.message).toBe('timeout');
  });

  it('maps meta.available_at + retry_after (409 slug_change_cooldown)', () => {
    const error = normalizeApiError({
      status: 409,
      data: envelope({
        error_code: 'slug_change_cooldown',
        meta: { locale: 'en', retry_after: 86400, available_at: '2026-11-05T10:00:00Z' },
      }),
    });

    expect(error.code).toBe('slug_change_cooldown');
    expect(error.retryAfter).toBe(86400);
    expect(error.availableAt).toBe('2026-11-05T10:00:00Z');
    expect(error.reason).toBeNull();
  });

  it('maps meta.reason (422 slug_unavailable)', () => {
    const error = normalizeApiError({
      status: 422,
      data: envelope({ error_code: 'slug_unavailable', meta: { locale: 'en', reason: 'reserved' } }),
    });

    expect(error.code).toBe('slug_unavailable');
    expect(error.reason).toBe('reserved');
    expect(error.availableAt).toBeNull();
  });

  it('ignores non-string meta extras', () => {
    const error = normalizeApiError({
      status: 409,
      data: envelope({ error_code: 'media_kit_private', meta: { reason: 3, available_at: '' } }),
    });

    expect(error.code).toBe('media_kit_private');
    expect(error.reason).toBeNull();
    expect(error.availableAt).toBeNull();
  });
});
