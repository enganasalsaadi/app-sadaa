import { useCallback } from 'react';
import { toastService } from './toastService';
import type { ToastOptions } from './toastService';

export const useToast = () => {
  const success = useCallback(
    (message?: string, options?: ToastOptions) => toastService.success(message, options),
    [],
  );

  const error = useCallback(
    (message?: string, options?: ToastOptions) => toastService.error(message, options),
    [],
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => toastService.warning(message, options),
    [],
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => toastService.info(message, options),
    [],
  );

  const hide = useCallback(() => toastService.hide(), []);

  return { success, error, warning, info, hide };
};
