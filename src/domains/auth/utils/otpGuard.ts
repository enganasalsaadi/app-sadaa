import type { AppApiError } from '@/core/api';
import { OTP_MAX_WRONG_ATTEMPTS } from '../constants/otp';

type OtpError = Pick<AppApiError, 'statusCode' | 'code' | 'retryAfter'>;

export interface OtpGuardState {
  /** 422 `code` rejections since the last send. */
  wrongAttempts: number;
  /** Epoch ms until verify is throttled (429); `null` = open. */
  lockedUntil: number | null;
}

export const OTP_GUARD_INITIAL: OtpGuardState = { wrongAttempts: 0, lockedUntil: null };

/** After 5 wrong codes the server answers every try with the same 422: only a resend helps. */
export const isOtpExhausted = (state: OtpGuardState): boolean =>
  state.wrongAttempts >= OTP_MAX_WRONG_ATTEMPTS;

/** Guard state after a rejected verify (contract §15.4). */
export const applyOtpRejection = (
  state: OtpGuardState,
  error: OtpError,
  now: number,
): OtpGuardState => {
  if (error.code === 'too_many_requests') {
    return error.retryAfter
      ? { ...state, lockedUntil: now + error.retryAfter * 1000 }
      : state;
  }
  if (error.statusCode === 422) {
    return { ...state, wrongAttempts: state.wrongAttempts + 1 };
  }
  return state;
};

/**
 * Resend unlock time reported by a failed send, or `null` when the error
 * carries none. The server's `retry_after` always wins over the local
 * estimate (contract §16).
 */
export const cooldownFromSendError = (error: OtpError, now: number): number | null =>
  (error.code === 'otp_cooldown' || error.code === 'too_many_requests') && error.retryAfter
    ? now + error.retryAfter * 1000
    : null;

/** `m:ss` for OTP timers. */
export const formatOtpTimer = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
