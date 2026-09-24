import React from 'react';
import type { ToastConfig } from 'react-native-toast-message';
import { ToastCard } from './ToastCard';

export const toastConfig: ToastConfig = {
  success: ({ text1, hide }) => (
    <ToastCard type="success" message={text1 ?? ''} onHide={hide} />
  ),
  error: ({ text1, hide }) => (
    <ToastCard type="error" message={text1 ?? ''} onHide={hide} />
  ),
  warning: ({ text1, hide }) => (
    <ToastCard type="warning" message={text1 ?? ''} onHide={hide} />
  ),
  info: ({ text1, hide }) => (
    <ToastCard type="info" message={text1 ?? ''} onHide={hide} />
  ),
};
