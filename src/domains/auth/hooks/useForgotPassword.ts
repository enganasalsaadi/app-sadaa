import { useCallback, useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForgotPasswordMutation } from '../api';
import { useApi } from '@/core/hooks';
import type { ForgotPasswordFormValues } from '../screens/ForgotPasswordScreen';

interface UseForgotPasswordOptions {
  onSuccess?: (email: string) => void;
  onError?: (error: unknown) => void;
}

/**
 * Link-based password recovery: POST /auth/forgot-password emails a reset link
 * (the user completes the reset on the web). The endpoint always resolves 200
 * with the same message whether or not the email exists, so success only means
 * "the request was accepted" — never leak account existence to the caller.
 */
export const useForgotPassword = (options: UseForgotPasswordOptions) => {
  const [forgotPasswordMut, forgotPasswordState] = useForgotPasswordMutation();
  const forgotPasswordApi = useApi(forgotPasswordState);

  // Stable ref so handleForgotPassword never re-creates when options change
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleForgotPassword: SubmitHandler<ForgotPasswordFormValues> =
    useCallback(
      async data => {
        const { onSuccess, onError } = optionsRef.current;
        try {
          await forgotPasswordMut({ email: data.email }).unwrap();
          onSuccess?.(data.email);
        } catch (err) {
          onError?.(err);
        }
      },
      [forgotPasswordMut],
    );

  return {
    handleForgotPassword,
    isLoading: forgotPasswordApi.isLoading,
    error: forgotPasswordApi.error,
  };
};
