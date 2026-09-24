import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Alert } from 'react-native';
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

// Prevents multiple "session expired" dialogs when several requests fail at once
let isHandlingSessionExpiry = false;
const isApiEnvelope = (value: unknown): value is ApiResponse<unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as ApiUnknownRecord;
  return typeof data.success === 'boolean' && 'data' in data;
};

const getErrorCode = (data: unknown): string | undefined => {
  if (typeof data !== 'object' || data === null) return undefined;
  const code = (data as ApiUnknownRecord).code;
  return typeof code === 'string' ? code : undefined;
};

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

type ExtraOptions = { withPagination?: boolean };

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
    return { data: result.data.data };
  }

  if (result.error) {
    const statusCode = result.error.status;
    const normalizedError = normalizeApiError(result.error);

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

    if (statusCode === 401) {
      // Sanadk tokens are non-refreshable — clear session and redirect to Login.
      await authStorage.clearTokens();
      api.dispatch({ type: 'auth/clearCredentials' });
      navigate('Login');

      return { error: result.error };
    }

    if (statusCode === 403) {
      const errorCode = getErrorCode(result.error.data);

      if (errorCode === 'jwt_auth_invalid_token') {
        if (!isHandlingSessionExpiry) {
          isHandlingSessionExpiry = true;
          await authStorage.clearTokens();
          api.dispatch({ type: 'auth/clearCredentials' });
          Alert.alert(
            i18n.t('errors.sessionExpired.title'),
            i18n.t('errors.sessionExpired.message'),
            [
              {
                text: i18n.t('common.cancel'),
                style: 'cancel',
                onPress: () => {
                  isHandlingSessionExpiry = false;
                },
              },
              {
                text: i18n.t('errors.sessionExpired.loginBtn'),
                onPress: () => {
                  isHandlingSessionExpiry = false;
                  navigate('Login');
                },
              },
            ],
            { cancelable: false },
          );
        }
        return { error: result.error };
      }

      toastService.error(normalizedError.message || i18n.t('errors.forbidden'));
      api.dispatch(showForbiddenError(normalizedError));
      navigate('HomeScreen');

      return { error: result.error };
    }

    if (statusCode === 404 || statusCode === 400) {
      return { error: result.error };
    }

    if (statusCode === 422) {
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
    'Preferences',
    'Profile',
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
});
