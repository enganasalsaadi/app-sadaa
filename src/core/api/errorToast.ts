import { toastService } from '../toast';
import type { ToastOptions } from '../toast';

export interface ShowErrorToastOptions extends ToastOptions {
  message?: string;
}

export const showErrorToast = ({ message, ...options }: ShowErrorToastOptions = {}) =>
  toastService.error(message, options);

export const showSuccessToast = (message?: string) =>
  toastService.success(message);

export const showInfoToast = (message: string) =>
  toastService.info(message);

export const showWarningToast = (message: string) =>
  toastService.warning(message);
