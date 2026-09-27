import { useCallback, useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { parsePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { useRequestPasswordResetMutation } from '../api';
import { useApi } from '@/core/hooks';
import { getApiErrorMessage } from '@/core/api';

// The "user not found" message must never be shown — it would let an
// attacker enumerate registered phone numbers. Treat it as a success on the
// client (same 200-response UX as if the phone existed).
const USER_NOT_FOUND_MESSAGE = 'المستخدم غير موجود';

export interface RequestPasswordResetFormValues {
  phone: string;
}

interface UseRequestPasswordResetOptions {
  countryCode: CountryCode;
  onSuccess?: (phone: string) => void;
  onError?: (error: unknown) => void;
}

export const useRequestPasswordReset = (
  options: UseRequestPasswordResetOptions,
) => {
  const [requestReset, requestResetState] = useRequestPasswordResetMutation();
  const requestResetApi = useApi(requestResetState);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleRequestReset: SubmitHandler<RequestPasswordResetFormValues> =
    useCallback(
      async data => {
        const { countryCode, onSuccess, onError } = optionsRef.current;
        const phone = parsePhoneNumber(data.phone, countryCode).format('E.164');

        try {
          await requestReset({ phone:data.phone }).unwrap();
          onSuccess?.(phone);
        } catch (err) {
          if (getApiErrorMessage(err) === USER_NOT_FOUND_MESSAGE) {
            onSuccess?.(phone);
            return;
          }
          onError?.(err);
        }
      },
      [requestReset],
    );

  // Never surface the enumeration-prevention error to the UI — it was
  // already treated as a success above.
  const error =
    requestResetApi.error?.message === USER_NOT_FOUND_MESSAGE
      ? null
      : requestResetApi.error;

  return {
    handleRequestReset,
    isLoading: requestResetApi.isLoading,
    error,
  };
};
