import Toast from 'react-native-toast-message';
import i18n from '@/core/i18n';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

class ToastServiceClass {
  private show(
    type: ToastType,
    message: string,
    options: ToastOptions = {},
  ): void {
    Toast.show({
      type,
      text1: message,
      position: options.position ?? 'top',
      visibilityTime: options.duration ?? 3600,
    });
  }

  success(message?: string, options?: ToastOptions): void {
    this.show('success', message ?? i18n.t('common.success'), options);
  }

  error(message?: string, options?: ToastOptions): void {
    this.show('error', message ?? i18n.t('errors.generic'), options);
  }

  warning(message: string, options?: ToastOptions): void {
    this.show('warning', message, options);
  }

  info(message: string, options?: ToastOptions): void {
    this.show('info', message, options);
  }

  hide(): void {
    Toast.hide();
  }
}

export const toastService = new ToastServiceClass();
