import { useMemo, useEffect } from 'react';
import { normalizeApiError } from '../api/errorHandler';
import type { AppApiError } from '../api/errorHandler';

interface ApiState<TData> {
  data?: TData;
  error?: unknown;
  isError?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  refetch?: (() => unknown) | undefined;
  reset?: (() => void) | undefined;
}

interface UseApiOptions<TData> {
  /** عرض رسالة خطأ تلقائياً */
  showErrorToast?: boolean;
  /** استدعاء عند النجاح */
  onSuccess?: (data: TData) => void;
  /** استدعاء عند الخطأ */
  onError?: (error: AppApiError) => void;
}

export const useApi = <TData,>(
  state: ApiState<TData>,
  options?: UseApiOptions<TData>
) => {
  const { showErrorToast = false, onSuccess, onError } = options ?? {};

  // ✅ تطبيع الخطأ
  const normalizedError = useMemo(() => {
    if (!state.error) return null;
    return normalizeApiError(state.error);
  }, [state.error]);

  // ✅ مراقبة النجاح
  useEffect(() => {
    if (state.isSuccess && state.data && onSuccess) {
      onSuccess(state.data);
    }
  }, [state.isSuccess, state.data, onSuccess]);

  // ✅ مراقبة الخطأ
  useEffect(() => {
    if (state.isError && normalizedError && onError) {
      onError(normalizedError);
    }
    
    // ✅ عرض رسالة خطأ تلقائي (يمكنك تفعيل Toast هنا)
    if (showErrorToast && state.isError && normalizedError) {
      // مثال: Toast.show(normalizedError.message, 'error');
      console.log('[Toast Error]', normalizedError.message);
    }
  }, [state.isError, normalizedError, showErrorToast, onError]);

  return useMemo(
    () => ({
      data: state.data ?? null,
      error: normalizedError,
      hasData: state.data !== undefined && state.data !== null,
      isError: Boolean(state.isError),
      isLoading: Boolean(state.isLoading || state.isFetching),
      isSuccess: Boolean(state.isSuccess),
      canRetry: typeof state.refetch === 'function',
      refetch: state.refetch,
      reset: state.reset,
    }),
    [
      normalizedError,
      state.data,
      state.isError,
      state.isFetching,
      state.isLoading,
      state.isSuccess,
      state.refetch,
      state.reset,
    ],
  );
};