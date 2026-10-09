import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { useDeleteAccountMutation } from '../api';
import { selectUser } from '../store';
import { createDeleteAccountSchema } from '../schemas';
import type { DeleteAccountFormValues } from '../schemas';
import { formatClock } from '../utils/formatClock';
import { useOpenSupport } from './useOpenSupport';

const SERVER_FIELD_MAP = {
  current_password: 'currentPassword',
} as const satisfies Record<string, keyof DeleteAccountFormValues>;

const DEFAULT_VALUES: DeleteAccountFormValues = { currentPassword: '' };

/** `422 account_has_funds` (wallet handoff §1): deletion waits until the wallet is empty. */
export interface DeleteAccountFundsBlock {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  /** Creators may also have funds stuck in escrow, which only support can release. */
  showSupportLink: boolean;
  onContactSupport: () => void;
}

export const useDeleteAccountSheet = (
  visible: boolean,
  onClose: () => void,
  onOpenWallet?: () => void,
) => {
  const { t } = useTranslation();
  const userType = useAppSelector(selectUser)?.user_type ?? null;
  const openSupport = useOpenSupport();
  const schema = useMemo(() => createDeleteAccountSchema(t), [t]);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [fundsMessage, setFundsMessage] = useState<string | null>(null);
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
    setFundsMessage(null);
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
        const error = normalizeApiError(err);
        if (error.code === 'account_has_funds') {
          setFundsMessage(error.message);
          return;
        }
        if (applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) return;
        if (error.code === 'too_many_requests' && error.retryAfter) {
          setLockedUntil(Date.now() + error.retryAfter * 1000);
          return;
        }
        // Any other refusal shows the server's reason.
        setApiError(error);
      }
    })();
  }, [deleteAccount, handleSubmit, isDeleting, lockSeconds, setError, t]);

  const onContactSupport = useCallback(
    () => openSupport(t('auth.deleteAccount.funds.supportMessage')),
    [openSupport, t],
  );

  const onGoToWallet = useCallback(() => {
    onClose();
    onOpenWallet?.();
  }, [onClose, onOpenWallet]);

  // Creators empty the wallet themselves (only where the wallet tab exists); brands and
  // everyone outside the signed-in tabs go through support.
  const canOpenWallet = userType === 'influencer' && onOpenWallet !== undefined;
  const fundsBlock = useMemo<DeleteAccountFundsBlock | null>(
    () =>
      fundsMessage === null
        ? null
        : {
            message: fundsMessage,
            primaryLabel: canOpenWallet
              ? t('auth.deleteAccount.funds.openWallet')
              : t('auth.deleteAccount.funds.contactSupport'),
            onPrimary: canOpenWallet ? onGoToWallet : onContactSupport,
            showSupportLink: canOpenWallet,
            onContactSupport,
          },
    [canOpenWallet, fundsMessage, onContactSupport, onGoToWallet, t],
  );

  const error =
    lockSeconds > 0 ? t('auth.deleteAccount.locked', { time: formatClock(lockSeconds) }) : apiError;

  return { control, onConfirm, onCancel, isDeleting, error, fundsBlock };
};
