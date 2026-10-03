import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { toastService } from '@/core/toast';
import { useDeleteAccountMutation } from '../api';
import { createDeleteAccountSchema } from '../schemas';
import type { DeleteAccountFormValues } from '../schemas';
import { formatClock } from '../utils/formatClock';

const SERVER_FIELD_MAP = {
  current_password: 'currentPassword',
} as const satisfies Record<string, keyof DeleteAccountFormValues>;

const DEFAULT_VALUES: DeleteAccountFormValues = { currentPassword: '' };

export const useDeleteAccountSheet = (visible: boolean, onClose: () => void) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createDeleteAccountSchema(t), [t]);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  // Server throttles at 5/min; `retry_after` drives the countdown.
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const lockSeconds = useCountdown(lockedUntil);

  const { control, handleSubmit, setError, reset } = useForm<DeleteAccountFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  // A typed password never survives closing the sheet.
  useEffect(() => {
    if (visible) return;
    reset(DEFAULT_VALUES);
    setApiError(null);
  }, [reset, visible]);

  const onCancel = useCallback(() => {
    if (!isDeleting) onClose();
  }, [isDeleting, onClose]);

  const onConfirm = useCallback(() => {
    handleSubmit(async ({ currentPassword }) => {
      if (isDeleting || lockSeconds > 0) return;
      setApiError(null);
      try {
        await deleteAccount({ current_password: currentPassword }).unwrap();
        // The session is gone: AppStatus swaps to the Login branch on its own.
        toastService.success(t('auth.deleteAccount.success'));
      } catch (err) {
        if (applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) return;
        const error = normalizeApiError(err);
        if (error.code === 'too_many_requests' && error.retryAfter) {
          setLockedUntil(Date.now() + error.retryAfter * 1000);
          return;
        }
        // Any other refusal (e.g. a future escrow hold) shows the server's reason.
        setApiError(error);
      }
    })();
  }, [deleteAccount, handleSubmit, isDeleting, lockSeconds, setError, t]);

  const error =
    lockSeconds > 0 ? t('auth.deleteAccount.locked', { time: formatClock(lockSeconds) }) : apiError;

  return { control, onConfirm, onCancel, isDeleting, error };
};
