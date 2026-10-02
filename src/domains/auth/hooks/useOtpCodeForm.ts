import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { toastService } from '@/core/toast';
import type { OtpInputHandle } from '@/shared/ui';
import { createOtpSchema } from '../schemas';
import type { OtpFormValues } from '../schemas';
import {
  OTP_GUARD_INITIAL,
  applyOtpRejection,
  cooldownFromSendError,
  formatOtpTimer,
  isOtpExhausted,
} from '../utils/otpGuard';

export type OtpRejection = Pick<AppApiError, 'statusCode' | 'code' | 'retryAfter'>;

/** `user` = the resend link (toasts success); `entry` = sent on screen entry (silent). */
export type OtpSendOrigin = 'user' | 'entry';

interface UseOtpCodeFormOptions {
  length: number;
  /**
   * Resolves the rejection when the code was refused (shakes, counts toward
   * the 5-try limit), or `null` when accepted or nothing to report.
   */
  verify: (code: string) => Promise<OtpRejection | null>;
  /** Sends a new code; throws on failure. */
  resend: () => Promise<unknown>;
  /** Epoch ms when resend unlocks by the caller's clock; `null` = available now. */
  resendAvailableAt: number | null;
  /** Called on every edit, e.g. to clear a server error. */
  onEdit?: () => void;
}

/**
 * Code-entry behaviour shared by every OTP step (contract §15.4): auto-submit
 * on the last digit, shake + clear on rejection, 5 wrong codes → "request a
 * new one", 429 → verify locked for `retry_after`, resend cooldown resynced
 * from the server on 429. Render with `OtpCodeField`.
 */
export const useOtpCodeForm = ({
  length,
  verify,
  resend,
  resendAvailableAt,
  onEdit,
}: UseOtpCodeFormOptions) => {
  const { t } = useTranslation();
  const otpRef = useRef<OtpInputHandle>(null);
  const [isResending, setIsResending] = useState(false);
  const sendingRef = useRef(false);
  const [guard, setGuard] = useState(OTP_GUARD_INITIAL);
  const [serverCooldownUntil, setServerCooldownUntil] = useState<number | null>(null);

  // A 429's `retry_after` replaces the local estimate until the next good send.
  const cooldown = useCountdown(serverCooldownUntil ?? resendAvailableAt);
  const lockSeconds = useCountdown(guard.lockedUntil);
  const exhausted = isOtpExhausted(guard);
  const blocked = exhausted || lockSeconds > 0;

  // Latest callbacks without re-creating the handlers below on every render.
  const latest = useRef({ verify, resend, onEdit });
  latest.current = { verify, resend, onEdit };

  const schema = useMemo(() => createOtpSchema(t, length), [t, length]);
  const { control, handleSubmit, setValue } = useForm<OtpFormValues>({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
    defaultValues: { code: '' },
  });

  /** Applies a refused code, also when the refusal comes from a later step. */
  const reject = useCallback(
    (rejection: OtpRejection) => {
      setGuard(prev => applyOtpRejection(prev, rejection, Date.now()));
      otpRef.current?.shake();
      setValue('code', '');
      otpRef.current?.focus();
    },
    [setValue],
  );

  const onSubmit = useCallback(() => {
    if (blocked) return;
    handleSubmit(async ({ code }) => {
      const rejection = await latest.current.verify(code);
      if (rejection) reject(rejection);
    })();
  }, [blocked, handleSubmit, reject]);

  const onChangeCode = useCallback(
    (code: string) => {
      setValue('code', code);
      latest.current.onEdit?.();
    },
    [setValue],
  );

  const requestCode = useCallback(
    async (origin: OtpSendOrigin) => {
      if (sendingRef.current || (origin === 'user' && cooldown > 0)) return;
      sendingRef.current = true;
      setIsResending(true);
      try {
        await latest.current.resend();
        setServerCooldownUntil(null);
        // A new code replaces the dead one; the verify throttle is separate.
        setGuard(prev => ({ ...prev, wrongAttempts: 0 }));
        if (origin === 'user') toastService.success(t('auth.otpResent'));
      } catch (err) {
        const error = normalizeApiError(err);
        const until = cooldownFromSendError(error, Date.now());
        if (until !== null) setServerCooldownUntil(until);
        // `otp_cooldown` means a code is already out: the countdown says it.
        if (error.code !== 'otp_cooldown') toastService.error(error.message);
      } finally {
        sendingRef.current = false;
        setIsResending(false);
      }
    },
    [cooldown, t],
  );

  const onResend = useCallback(() => requestCode('user'), [requestCode]);

  const notice = exhausted
    ? t('auth.otp.exhausted')
    : lockSeconds > 0
      ? t('auth.otp.locked', { time: formatOtpTimer(lockSeconds) })
      : undefined;

  return {
    length,
    control,
    otpRef,
    onSubmit,
    onChangeCode,
    cooldown,
    isResending,
    onResend,
    requestCode,
    reject,
    /** Verify is pointless right now (code dead or throttled). */
    blocked,
    /** Why `blocked`, shown in place of the server error. */
    notice,
  };
};

export type OtpCodeForm = ReturnType<typeof useOtpCodeForm>;
