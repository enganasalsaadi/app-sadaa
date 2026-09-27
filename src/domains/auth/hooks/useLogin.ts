import { useCallback, useRef } from 'react';
import { parsePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { SubmitHandler } from 'react-hook-form';
import { useAuth } from './useAuth';

export interface LoginFormValues {
  phone: string;
  password: string;
}

interface UseLoginOptions {
  countryCode: CountryCode;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useLogin = (options: UseLoginOptions) => {
  const { login, isLoggingIn, loginError } = useAuth();

  // Stable ref so handleLogin never re-creates when options change
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleLogin: SubmitHandler<LoginFormValues> = useCallback(
    async data => {
      const { countryCode, onSuccess, onError } = optionsRef.current;

      try {
        const parsed = parsePhoneNumber(data.phone, countryCode);
        const result = await login({
          phone: parsed.format('E.164'),
          password: data.password,
        });

        if (result && 'error' in result) {
          onError?.(result.error);
          return;
        }
        onSuccess?.();
      } catch (err) {
        onError?.(err);
      }
    },
    [login],
  );

  return {
    handleLogin,
    isLoading: isLoggingIn,
    error: loginError,
  };
};
