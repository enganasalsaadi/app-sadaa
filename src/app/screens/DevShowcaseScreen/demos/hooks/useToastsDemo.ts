import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

export const useToastsDemo = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const showSuccess = useCallback(
    () => toast.success(t('devShowcase.modalsToasts.toastSuccessMessage')),
    [t, toast],
  );
  const showError = useCallback(
    () => toast.error(t('devShowcase.modalsToasts.toastErrorMessage')),
    [t, toast],
  );
  const showWarning = useCallback(
    () => toast.warning(t('devShowcase.modalsToasts.toastWarningMessage')),
    [t, toast],
  );
  const showInfo = useCallback(
    () => toast.info(t('devShowcase.modalsToasts.toastInfoMessage')),
    [t, toast],
  );

  return { showSuccess, showError, showWarning, showInfo };
};
