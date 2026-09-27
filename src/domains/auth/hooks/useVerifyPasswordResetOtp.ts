import { useCallback, useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import {
  useVerifyPasswordResetOtpMutation,
  useResendPasswordResetOtpMutation,
} from '../api';
import { useApi } from '@/core/hooks';

export interface VerifyPasswordResetOtpFormValues {
  code: string;
}

interface UseVerifyPasswordResetOtpOptions {
  phone: string;
  onSuccess?: (code: string) => void;
  onError?: (error: unknown) => void;
}

export const useVerifyPasswordResetOtp = (
  options: UseVerifyPasswordResetOtpOptions,
) => {
  const [verifyOtp, verifyOtpState] = useVerifyPasswordResetOtpMutation();
  const [resendOtp, resendOtpState] = useResendPasswordResetOtpMutation();
  const verifyOtpApi = useApi(verifyOtpState);
  const resendOtpApi = useApi(resendOtpState);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleVerify: SubmitHandler<VerifyPasswordResetOtpFormValues> =
    useCallback(
      async data => {
        const { phone, onSuccess, onError } = optionsRef.current;
        try {
          await verifyOtp({
            phone,
            code: data.code,
            type: 'password_reset',
          }).unwrap();
          onSuccess?.(data.code);
        } catch (err) {
          onError?.(err);
        }
      },
      [verifyOtp],
    );

  const handleResend = useCallback(async () => {
    const { phone, onError } = optionsRef.current;
    try {
      await resendOtp({ phone, type: 'password_reset' }).unwrap();
    } catch (err) {
      onError?.(err);
    }
  }, [resendOtp]);

  return {
    handleVerify,
    handleResend,
    isVerifying: verifyOtpApi.isLoading,
    isResending: resendOtpApi.isLoading,
    error: verifyOtpApi.error,
  };
};
