import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getVersion } from 'react-native-device-info';
import { appStorage, StorageKeys } from '@/core/storage';
import { getValidLanguage } from '@/core/i18n';
import type { ApiResponse, ApiUnknownRecord } from './types';
import { authStorage } from '@/core/storage';
import { normalizeApiError } from './errorHandler';
import {
  showServerError,
  showNetworkError,
  showForbiddenError,
} from '@/core/store';
import { toastService } from '../toast';
import { navigate } from '@/core/navigation';
import { retryRegistry } from './retryRegistry';
import { apiUrl } from '@/core/config';
import i18n from '@/core/i18n';

// Serialises session teardown when several requests 401 at once.
let isHandlingSessionExpiry = false;
const isApiEnvelope = (value: unknown): value is ApiResponse<unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as ApiUnknownRecord;
  return typeof data.success === 'boolean' && 'data' in data;
};

// Default per request; slow endpoints (social lookup, 35 s) pass `timeout`
// in their FetchArgs.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiUrl,
  timeout: 15000,
  prepareHeaders: headers => {
    const token = authStorage.getToken();
    const language = appStorage.get(StorageKeys.LANGUAGE);
    const validLanguage = getValidLanguage(language);
    headers.set('Accept', 'application/json');
    headers.set('Accept-Language', validLanguage);
    headers.set('X-App-Version', getVersion());

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

type ExtraOptions = {
  withPagination?: boolean;
  /** Return `{ data, meta }` (`WithMeta`) instead of `data` — for success meta like `canonical_slug`. */
  withMeta?: boolean;
  /** Skip global error UI (modal/snackbar) — caller handles failure itself, e.g. boot config (fail-open). */
  silent?: boolean;
};

const baseQueryWithGlobalErrorHandler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  ExtraOptions
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if ('data' in result && isApiEnvelope(result.data)) {
    if (!result.data.success) {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: result.data,
          error: result.data.message,
        },
      };
    }
    const pagination = result.data.meta?.pagination ?? result.data.pagination;
    if (extraOptions?.withPagination && pagination) {
      return {
        data: { items: result.data.data, pagination },
      };
    }
    if (extraOptions?.withMeta) {
      return { data: { data: result.data.data, meta: result.data.meta ?? {} } };
    }
    return { data: result.data.data };
  }

  if (result.error) {
    const statusCode = result.error.status;
    const normalizedError = normalizeApiError(result.error);

    if (statusCode === 401) {
      // Tokens are non-refreshable (contract §1). Only tear down a session we
      // actually sent; concurrent 401s from the same session reset once.
      if (authStorage.getToken() && !isHandlingSessionExpiry) {
        isHandlingSessionExpiry = true;
        try {
          await authStorage.clearSession();
          api.dispatch({ type: 'auth/clearCredentials' });
          api.dispatch(baseApi.util.resetApiState());
          navigate('Login');
        } finally {
          isHandlingSessionExpiry = false;
        }
      }

      return { error: result.error };
    }

    // Any `/user/*`, `/social/*`… call of a suspended account (contract H19),
    // silent ones included. Token check: a late response after logout must
    // not flag the next session.
    if (
      statusCode === 403 &&
      normalizedError.code === 'account_suspended' &&
      authStorage.getToken()
    ) {
      api.dispatch({ type: 'auth/setAccountSuspended', payload: true });
      return { error: result.error };
    }

    // Silent skips the error UI only; an expired session is torn down regardless.
    if (extraOptions?.silent) {
      return { error: result.error };
    }

    if (statusCode === 500) {
      const retryKey = retryRegistry.register(async () => {
        const retryResult = await rawBaseQuery(args, api, extraOptions);
        if (retryResult.error) throw retryResult.error;
        return retryResult;
      });

      api.dispatch(showServerError({ error: normalizedError, retryKey }));
      return { error: result.error };
    }

    if (statusCode === 503) {
      const retryKey = retryRegistry.register(async () => {
        const retryResult = await rawBaseQuery(args, api, extraOptions);
        if (retryResult.error) throw retryResult.error;
        return retryResult;
      });

      api.dispatch(showServerError({ error: normalizedError, retryKey }));
      return { error: result.error };
    }

    if (statusCode === 403) {
      // Flow gates, routed by their owners: the onboarding resolver sends
      // `phone_not_verified` back to the OTP step; `account_suspended` without
      // a session (nothing to gate) stays with the caller.
      if (
        normalizedError.code === 'phone_not_verified' ||
        normalizedError.code === 'account_suspended'
      ) {
        return { error: result.error };
      }

      toastService.error(normalizedError.message || i18n.t('errors.forbidden'));
      api.dispatch(showForbiddenError(normalizedError));

      return { error: result.error };
    }

    // 409 conflicts and 429 rate limits carry flow-specific meaning
    // (`otp_cooldown`, `onboarding_step_out_of_order`…): the calling screen
    // handles them. 400/404/422 render inline / map onto fields.
    if (
      statusCode === 400 ||
      statusCode === 404 ||
      statusCode === 409 ||
      statusCode === 422 ||
      statusCode === 429
    ) {
      return { error: result.error };
    }

    if (statusCode === 'FETCH_ERROR' || statusCode === 'TIMEOUT_ERROR') {
      const retryKey = retryRegistry.register(async () => {
        const retryResult = await rawBaseQuery(args, api, extraOptions);
        if (retryResult.error) throw retryResult.error;
        return retryResult;
      });

      api.dispatch(showNetworkError({ retryKey }));
      return { error: result.error };
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  tagTypes: [
    'Auth',
    'AppConfig',
    'User',
    'Settings',
    'Profile',
    'Platform',
    'RateCard',
    'Kyc',
    'Notification',
    'Lookups',
    'OnboardingProgress',
    'MediaKit',
    'MediaKitStats',
    'PublicMediaKit',
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
});
