import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import type { SubmitHandler } from 'react-hook-form';
import { useAuth } from './useAuth';

export interface VerifyOtpFormValues {
  otp: string;
}

interface UseVerifyOtpOptions {
  email: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useVerifyOtp = (options: UseVerifyOtpOptions) => {
  const {
    verifyOtp,
    resendOtp,
    isVerifyingOtp,
    isResendingOtp,
    verifyOtpError,
    resendOtpError,
  } = useAuth();

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleVerify: SubmitHandler<VerifyOtpFormValues> = useCallback(
    async data => {
      const { email, onSuccess, onError } = optionsRef.current;
      const device_name = Platform.OS === 'ios' ? 'ios-app' : 'android-app';

      try {
        const result = await verifyOtp({
          email,
          otp: data.otp,
          device_name,
        });

        if (result && 'error' in result) {
          onError?.(result.error);
          return;
        }
        // Login + navigation handled in the endpoint's onQueryStarted.
        onSuccess?.();
      } catch (err) {
        onError?.(err);
      }
    },
    [verifyOtp],
  );

  const handleResend = useCallback(async () => {
    const { email, onError } = optionsRef.current;
    try {
      const result = await resendOtp({ email });
      if (result && 'error' in result) {
        onError?.(result.error);
      }
    } catch (err) {
      onError?.(err);
    }
  }, [resendOtp]);

  return {
    handleVerify,
    handleResend,
    isVerifying: isVerifyingOtp,
    isResending: isResendingOtp,
    error: verifyOtpError,
    resendError: resendOtpError,
  };
};
