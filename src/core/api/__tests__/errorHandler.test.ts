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
});
