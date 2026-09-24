import { useCallback, useRef } from 'react';
import { parsePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { appStorage, StorageKeys } from '@/core/storage';
import { useAuth } from './useAuth';

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface UseRegisterOptions {
  countryCode: string;
  setError?: UseFormSetError<RegisterFormValues>;
  onSuccess?: (email: string) => void;
  onError?: (error: unknown) => void;
}

const getServerMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return '';
  }
  const { data } = error;
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }
  return '';
};

export const useRegister = (options: UseRegisterOptions) => {
  const { register, isRegistering, registerError } = useAuth();

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleRegister: SubmitHandler<RegisterFormValues> = useCallback(
    async data => {
      const { countryCode, setError, onSuccess, onError } = optionsRef.current;

      try {
        const parsed = parsePhoneNumber(data.phone, countryCode as CountryCode);
        const phoneE164 = parsed.format('E.164');
        const fullName = `${data.firstName} ${data.lastName}`.trim();

        const result = await register({
          full_name: fullName,
          email: data.email,
          phone: phoneE164,
          password: data.password,
        });

        if (result && 'error' in result) {
          const message = getServerMessage(result.error);

          if (message.toLowerCase().includes('email')) {
            setError?.('email', { type: 'server', message });
            return;
          }
          if (message.toLowerCase().includes('phone')) {
            setError?.('phone', { type: 'server', message });
            return;
          }

          onError?.(result.error);
          return;
        }

        // Server returns the email to verify. Persist it so the OTP screen
        // survives a reload, then move to verification.
        const email = result.data?.email ?? data.email;
        appStorage.set(
          StorageKeys.PENDING_USER_DATA,
          JSON.stringify({ email }),
        );

        onSuccess?.(email);
      } catch (err) {
        onError?.(err);
      }
    },
    [register],
  );

  return {
    handleRegister,
    isLoading: isRegistering,
    error: registerError,
  };
};
