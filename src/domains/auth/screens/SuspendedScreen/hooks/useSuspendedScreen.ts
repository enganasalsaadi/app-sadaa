import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { baseApi, normalizeApiError, useGetConfigQuery } from '@/core/api';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { useAppDispatch } from '@/core/store';
import { toastService } from '@/core/toast';
import { openWhatsApp } from '@/shared/utils';
import { useLazyGetOnboardingProgressQuery, useLogoutMutation } from '../../../api';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

export const useSuspendedScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: config } = useGetConfigQuery();
  const [fetchProgress, { isFetching: isChecking }] = useLazyGetOnboardingProgressQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const supportNumber = config?.support.whatsapp || SUPPORT_WHATSAPP_NUMBER;

  const onContactSupport = useCallback(() => {
    openWhatsApp(supportNumber, t('auth.suspended.supportMessage')).catch(() =>
      toastService.error(
        t('auth.suspended.openFailed', { number: formatPhoneForDisplay(supportNumber) }),
      ),
    );
  }, [supportNumber, t]);

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

  return { onContactSupport, onCheckAgain, isChecking, onLogout, isLoggingOut };
};
