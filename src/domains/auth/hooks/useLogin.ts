import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { parsePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { SubmitHandler } from 'react-hook-form';
import { useAuth } from './useAuth';

export interface LoginFormValues {
  username: string;
  password: string;
}

interface UseLoginOptions {
  loginType: 'username' | 'phone';
  countryCode: string;
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
      const { loginType, countryCode, onSuccess, onError } = optionsRef.current;

      const device_name = Platform.OS === 'ios' ? 'ios-app' : 'android-app';

      try {
        let result;

        if (loginType === 'phone') {
          const parsed = parsePhoneNumber(
            data.username,
            countryCode as CountryCode,
          );
          result = await login({
            email: parsed.format('E.164'),
            password: data.password,
            device_name,
          });
        } else {
          result = await login({
            email: data.username,
            password: data.password,
            device_name,
          });
        }

        if (result && 'error' in result) {
          onError?.(result.error);
          return;
        }
        // await registerToken();
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
