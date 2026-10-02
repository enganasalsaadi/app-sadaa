import {
  OTP_GUARD_INITIAL,
  applyOtpRejection,
  cooldownFromSendError,
  formatOtpTimer,
  isOtpExhausted,
} from '../otpGuard';

const NOW = 1_000_000;
const wrongCode = { statusCode: 422, code: 'validation_failed', retryAfter: null } as const;
const throttled = { statusCode: 429, code: 'too_many_requests', retryAfter: 30 } as const;

describe('applyOtpRejection', () => {
  it('counts 422 rejections and exhausts the code at 5', () => {
    let state = OTP_GUARD_INITIAL;
    for (let i = 0; i < 4; i += 1) state = applyOtpRejection(state, wrongCode, NOW);
    expect(isOtpExhausted(state)).toBe(false);
    state = applyOtpRejection(state, wrongCode, NOW);
    expect(state.wrongAttempts).toBe(5);
    expect(isOtpExhausted(state)).toBe(true);
  });

  it('locks verify for retry_after on 429 without counting a wrong code', () => {
    const state = applyOtpRejection(OTP_GUARD_INITIAL, throttled, NOW);
    expect(state).toEqual({ wrongAttempts: 0, lockedUntil: NOW + 30_000 });
  });

  it('ignores a 429 without retry_after and non-code errors', () => {
    const noRetry = { ...throttled, retryAfter: null };
    expect(applyOtpRejection(OTP_GUARD_INITIAL, noRetry, NOW)).toBe(OTP_GUARD_INITIAL);
    const serverError = { statusCode: 500, code: 'server_error', retryAfter: null } as const;
    expect(applyOtpRejection(OTP_GUARD_INITIAL, serverError, NOW)).toBe(OTP_GUARD_INITIAL);
  });
});

describe('cooldownFromSendError', () => {
  it('restarts the countdown from the server on otp_cooldown and too_many_requests', () => {
    const cooldown = { statusCode: 429, code: 'otp_cooldown', retryAfter: 42 } as const;
    expect(cooldownFromSendError(cooldown, NOW)).toBe(NOW + 42_000);
    expect(cooldownFromSendError(throttled, NOW)).toBe(NOW + 30_000);
  });

  it('returns null for other errors', () => {
    expect(cooldownFromSendError(wrongCode, NOW)).toBeNull();
  });
});

describe('formatOtpTimer', () => {
  it('formats m:ss', () => {
    expect(formatOtpTimer(0)).toBe('0:00');
    expect(formatOtpTimer(42)).toBe('0:42');
    expect(formatOtpTimer(1800)).toBe('30:00');
  });
});
