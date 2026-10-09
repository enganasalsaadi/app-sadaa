import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { baseApi, normalizeApiError } from '@/core/api';
import { useAppDispatch } from '@/core/store';
import { toastService } from '@/core/toast';
import { useLazyGetOnboardingProgressQuery, useLogoutMutation } from '../../../api';
import { useOpenSupport } from '../../../hooks/useOpenSupport';

export const useSuspendedScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [fetchProgress, { isFetching: isChecking }] = useLazyGetOnboardingProgressQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const openSupport = useOpenSupport();

  const onContactSupport = useCallback(
    () => openSupport(t('auth.suspended.supportMessage')),
    [openSupport, t],
  );

  // Progress stays readable while suspended (contract H19). Its query syncs the
  // flag, so a reinstated account leaves this screen through AppStatus alone.
  const onCheckAgain = useCallback(async () => {
    try {
      const progress = await fetchProgress().unwrap();
      if (progress.status === 'suspended') {
        toastService.info(t('auth.suspended.stillSuspended'));
        return;
      }
      // App's `/me` subscription outlives this screen and still holds the 403.
      dispatch(baseApi.util.invalidateTags(['User']));
    } catch (error) {
      // Offline, 5xx and 401 are reported globally.
      if (normalizeApiError(error).code === 'account_suspended') {
        toastService.info(t('auth.suspended.stillSuspended'));
      }
    }
  }, [dispatch, fetchProgress, t]);

  const onLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      // The mutation signs out locally whatever the server answered.
    }
  }, [logout]);

  // Deletion skips the account.active gate, so a suspended user can still leave.
  const openDeleteSheet = useCallback(() => setDeleteSheetVisible(true), []);
  const closeDeleteSheet = useCallback(() => setDeleteSheetVisible(false), []);

  return {
    onContactSupport,
    onCheckAgain,
    isChecking,
    onLogout,
    isLoggingOut,
    deleteSheetVisible,
    openDeleteSheet,
    closeDeleteSheet,
  };
};
