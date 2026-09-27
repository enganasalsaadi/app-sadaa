import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { toastService } from '@/core/toast';
import type { OtpInputHandle } from '@/shared/ui';
import { createOtpSchema } from '../schemas';
import type { OtpFormValues } from '../schemas';

interface UseOtpCodeFormOptions {
  length: number;
  /** Resolves `true` when the code was accepted; `false` shakes and clears the cells. */
  verify: (code: string) => Promise<boolean>;
  /** Throws on failure (shown as a toast). */
  resend: () => Promise<unknown>;
  /** Epoch ms when resend unlocks; `null` = available now. */
  resendAvailableAt: number | null;
  /** Called on every edit, e.g. to clear a server error. */
  onEdit?: () => void;
}

/**
 * Code-entry behaviour shared by every OTP step: auto-submit on the last
 * digit, shake + clear on rejection, timestamp-based resend cooldown with
 * honest success/error feedback. Render with `OtpCodeField`.
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
  const cooldown = useCountdown(resendAvailableAt);

  // Latest callbacks without re-creating the handlers below on every render.
  const latest = useRef({ verify, resend, onEdit });
  latest.current = { verify, resend, onEdit };

  const schema = useMemo(() => createOtpSchema(t, length), [t, length]);
  const { control, handleSubmit, setValue } = useForm<OtpFormValues>({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
    defaultValues: { code: '' },
  });

  const onSubmit = useCallback(() => {
    handleSubmit(async ({ code }) => {
      const ok = await latest.current.verify(code);
      if (!ok) {
        otpRef.current?.shake();
        setValue('code', '');
        otpRef.current?.focus();
      }
    })();
  }, [handleSubmit, setValue]);

  const onChangeCode = useCallback(
    (code: string) => {
      setValue('code', code);
      latest.current.onEdit?.();
    },
    [setValue],
  );

  const onResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await latest.current.resend();
      toastService.success(t('auth.otpResent'));
    } catch (err) {
      toastService.error(getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }, [cooldown, isResending, t]);

  return { length, control, otpRef, onSubmit, onChangeCode, cooldown, isResending, onResend };
};

export type OtpCodeForm = ReturnType<typeof useOtpCodeForm>;
