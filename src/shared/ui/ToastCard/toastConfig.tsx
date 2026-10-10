import React from 'react';
import type { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import type { ToastProps } from '@/core/toast';
import { ToastCard, type ToastType } from './ToastCard';

// The library types `props` as `any`; `toastService` is the only producer.
const render =
  (type: ToastType) =>
  ({ text1, hide, props }: ToastConfigParams<ToastProps | undefined>) => (
    <ToastCard type={type} message={text1 ?? ''} onHide={hide} action={props?.action} />
  );

export const toastConfig: ToastConfig = {
  success: render('success'),
  error: render('error'),
  warning: render('warning'),
  info: render('info'),
};
