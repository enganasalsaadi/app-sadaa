import { useCallback, useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useResetPasswordMutation } from '../api';
import { useApi } from '@/core/hooks';

export interface ResetPasswordFormValues {
  password: string;
  passwordConfirmation: string;
}

interface UseResetPasswordOptions {
  phone: string;
  code: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useResetPassword = (options: UseResetPasswordOptions) => {
  const [resetPassword, resetPasswordState] = useResetPasswordMutation();
  const resetPasswordApi = useApi(resetPasswordState);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleResetPassword: SubmitHandler<ResetPasswordFormValues> =
    useCallback(
      async data => {
        const { phone, code, onSuccess, onError } = optionsRef.current;
        try {
          await resetPassword({
            phone,
            code,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
          }).unwrap();
          onSuccess?.();
        } catch (err) {
          onError?.(err);
        }
      },
      [resetPassword],
    );

  return {
    handleResetPassword,
    isLoading: resetPasswordApi.isLoading,
    error: resetPasswordApi.error,
  };
};
