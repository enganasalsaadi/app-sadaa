import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppApiError } from '@/core/api';
import {
  hideNetworkError,
  showNetworkError,
  showServerError,
  useAppDispatch,
} from '@/core/store';

const mockServerError = (
  statusCode: 500 | 503,
  message: string,
): AppApiError => ({
  statusCode,
  message,
  code: null,
  retryAfter: null,
  reason: null,
  availableAt: null,
  details: null,
  isValidationError: false,
  isUnauthorized: false,
  isForbidden: false,
  isServerError: true,
});

/** Drives the app-wide error chrome (mounted in App.tsx) with mock errors. */
export const useGlobalErrorsDemo = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const showServer500 = useCallback(() => {
    dispatch(
      showServerError({
        error: mockServerError(500, t('devShowcase.globalErrors.mock500')),
      }),
    );
  }, [dispatch, t]);
  const showServer503 = useCallback(() => {
    dispatch(
      showServerError({
        error: mockServerError(503, t('devShowcase.globalErrors.mock503')),
      }),
    );
  }, [dispatch, t]);
  const showOffline = useCallback(() => {
    dispatch(showNetworkError({}));
  }, [dispatch]);
  const hideOffline = useCallback(() => {
    dispatch(hideNetworkError());
  }, [dispatch]);

  return { showServer500, showServer503, showOffline, hideOffline };
};
